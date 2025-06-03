import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import axios from 'axios';
import { getSchoolIdFromContext } from "../middlewares/authMiddleware.js";

// Create a new prisma client instance with proper error handling
let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  throw new Error("Database initialization failed");
}

// Helper function to get school_id from authenticated context and validate it
const getAndValidateSchoolId = async (req) => {
  try {
    // Use the authentication middleware helper to get school context
    const schoolId = await getSchoolIdFromContext(req);
    
    if (!schoolId) {
      return { 
        schoolId: null, 
        error: "School context is required. Please ensure you're logged in properly." 
      };
    }

    // Validate that the school exists and is active in the database
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, schoolName: true, status: true }
    });

    if (!school) {
      return { 
        schoolId: null, 
        error: `School with ID ${schoolId} not found in database` 
      };
    }

    if (school.status === 'inactive') {
      return { 
        schoolId: null, 
        error: `School with ID ${schoolId} is inactive` 
      };
    }

    return { schoolId: school.id, school: school, error: null };
  } catch (error) {
    console.error("Error validating school:", error);
    return { 
      schoolId: null, 
      error: "Database error while validating school" 
    };
  }
};

// Add a connection test function
async function testPrismaConnection() {
  try {
    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    return true;
  } catch (error) {
    console.error("Prisma connection test failed:", error);
    return false;
  }
}

// Add connection check middleware 
export const checkDbConnection = async (req, res, next) => {
  try {
    const isConnected = await testPrismaConnection();
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        message: "Database connection error"
      });
    }
    next();
  } catch (error) {
    console.error("Database connection check failed:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection error"
    });
  }
};

// ==================== DRIVER CONTROLLERS ====================

/**
 * Get all drivers for a specific school
 */
export const getAllDrivers = async (req, res) => {
  try {
    // Ensure connection is valid first
    const isConnected = await testPrismaConnection();
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        message: "Database connection error"
      });
    }

    // Get and validate school ID from authenticated context
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    // Build where clause based on user role
    let whereClause = { schoolId: schoolId };
    
    // Allow admins to see drivers from specific schools or all schools
    if (req.user?.role === 'admin') {
      if (req.query.schoolId) {
        whereClause.schoolId = parseInt(req.query.schoolId);
      } else if (req.query.all === 'true') {
        whereClause = {}; // Admin can see all drivers across schools
      }
    }

    // Add search functionality
    if (req.query.search) {
      whereClause.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { licenseNumber: { contains: req.query.search, mode: 'insensitive' } },
        { phone: { contains: req.query.search } }
      ];
    }

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const [drivers, totalCount] = await Promise.all([
      prisma.driver.findMany({
        where: whereClause,
        include: {
          school: {
            select: {
              id: true,
              schoolName: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip: skip,
        take: limit
      }),
      prisma.driver.count({ where: whereClause })
    ]);
    
    res.status(200).json({
      success: true,
      data: drivers,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      meta: {
        schoolId: whereClause.schoolId || 'all',
        userRole: req.user?.role
      }
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single driver by ID (with school validation)
 */
export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }
    
    const driver = await prisma.driver.findFirst({
      where: { 
        id: id,
        schoolId: schoolId
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found or doesn't belong to this school"
      });
    }
    
    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch driver",
      error: error.message
    });
  }
};

/**
 * Create a new driver with school association
 */
export const createDriver = async (req, res) => {
  try {
    console.log('Received driver creation request');
    console.log('Request body keys:', Object.keys(req.body));
    
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }
    
    const {
      name,
      licenseNumber,
      contactNumber,
      address,
      experience,
      joiningDate,
      dateOfBirth,
      age,
      gender,
      maritalStatus,
      emergencyContact,
      bloodGroup,
      qualification,
      salary,
      isActive,
      photo
    } = req.body;
    
    console.log('Driver data received:', {
      name,
      contactNumber,
      schoolId,
      photoLength: photo ? photo.length : 0,
      hasPhoto: !!photo
    });
    
    // Validate required fields
    if (!name || !contactNumber || !gender) {
      console.error('Missing required fields:', { name: !!name, contactNumber: !!contactNumber, gender: !!gender });
      return res.status(400).json({
        success: false,
        message: "Please provide name, contact number, and gender"
      });
    }
    
    // Validate photo size if provided (check if it's too large)
    if (photo && photo.length > 1000000) { // ~1MB limit for base64 string
      console.error('Photo too large:', photo.length);
      return res.status(400).json({
        success: false,
        message: "Photo file is too large. Please use a smaller image."
      });
    }
    
    // Check if driver with the same license number already exists in the same school
    if (licenseNumber) {
      const existingDriver = await prisma.driver.findFirst({
        where: { 
          licenseNumber: licenseNumber,
          schoolId: schoolId
        }
      });
      
      if (existingDriver) {
        console.error('License number already exists in this school:', licenseNumber);
        return res.status(400).json({
          success: false,
          message: "Driver with this license number already exists in this school"
        });
      }
    }
    
    console.log('Creating driver in database...');
    
    const driver = await prisma.driver.create({
      data: {
        id: uuidv4(),
        name,
        licenseNumber: licenseNumber || null,
        contactNumber,
        address: address || null,
        experience: parseInt(experience) || 0,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        age: parseInt(age) || null,
        gender: gender || null,
        maritalStatus: maritalStatus || null,
        emergencyContact: emergencyContact || null,
        bloodGroup: bloodGroup || null,
        qualification: qualification || null,
        salary: parseFloat(salary) || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        photo: photo || null,
        schoolId: schoolId
      },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });
    
    console.log('Driver created successfully with ID:', driver.id);
    
    res.status(201).json({
      success: true,
      data: driver,
      message: "Driver created successfully"
    });
  } catch (error) {
    console.error("Error creating driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create driver",
      error: error.message
    });
  }
};

/**
 * Update an existing driver (with school validation)
 */
export const updateDriver = async (req, res) => {
  try {
    console.log('Received driver update request');
    console.log('Request body keys:', Object.keys(req.body));
    
    const { id } = req.params;
    
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }
    
    const {
      name,
      licenseNumber,
      contactNumber,
      address,
      experience,
      joiningDate,
      dateOfBirth,
      age,
      gender,
      maritalStatus,
      emergencyContact,
      bloodGroup,
      qualification,
      salary,
      isActive,
      photo
    } = req.body;
    
    console.log('Driver update data received:', {
      id,
      name,
      contactNumber,
      schoolId,
      photoLength: photo ? photo.length : 0,
      hasPhoto: !!photo
    });
    
    // Check if driver exists and belongs to the school
    const driverExists = await prisma.driver.findFirst({
      where: { 
        id: id,
        schoolId: schoolId
      }
    });
    
    if (!driverExists) {
      console.error('Driver not found or does not belong to this school:', id);
      return res.status(404).json({
        success: false,
        message: "Driver not found or doesn't belong to this school"
      });
    }
    
    // Validate photo size if provided (check if it's too large)
    if (photo && photo.length > 1000000) { // ~1MB limit for base64 string
      console.error('Photo too large during update:', photo.length);
      return res.status(400).json({
        success: false,
        message: "Photo file is too large. Please use a smaller image."
      });
    }
    
    // Check if driver with the same license number already exists in the same school
    if (licenseNumber && licenseNumber !== driverExists.licenseNumber) {
      const existingDriverWithLicense = await prisma.driver.findFirst({
        where: { 
          licenseNumber: licenseNumber,
          schoolId: schoolId,
          id: { not: id } // Exclude current driver
        }
      });
      
      if (existingDriverWithLicense) {
        console.error('License number already exists for different driver in this school:', licenseNumber);
        return res.status(400).json({
          success: false,
          message: "Another driver with this license number already exists in this school"
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber || null;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (address !== undefined) updateData.address = address || null;
    if (experience !== undefined) updateData.experience = parseInt(experience) || 0;
    if (joiningDate !== undefined) updateData.joiningDate = joiningDate ? new Date(joiningDate) : null;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (age !== undefined) updateData.age = parseInt(age) || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus || null;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact || null;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup || null;
    if (qualification !== undefined) updateData.qualification = qualification || null;
    if (salary !== undefined) updateData.salary = parseFloat(salary) || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (photo !== undefined) updateData.photo = photo || null;
    
    console.log('Updating driver in database with data keys:', Object.keys(updateData));
    
    const driver = await prisma.driver.update({
      where: { id },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });
    
    console.log('Driver updated successfully:', driver.id);
    
    res.status(200).json({
      success: true,
      data: driver,
      message: "Driver updated successfully"
    });
  } catch (error) {
    console.error("Error updating driver:", error);
    
    // Check for specific database errors
    if (error.code === 'P2002') {
      console.error('Unique constraint violation during update:', error.meta);
      return res.status(400).json({
        success: false,
        message: "A driver with this information already exists",
        error: error.message
      });
    }
    
    // Check for invalid date errors
    if (error.message && error.message.includes('Invalid date')) {
      console.error('Invalid date error during update:', error.message);
      return res.status(400).json({
        success: false,
        message: "Invalid date format provided. Please check the date fields.",
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to update driver",
      error: error.message
    });
  }
};

/**
 * Delete a driver (with school validation)
 */
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }
    
    // Check if driver exists and belongs to the school
    const driver = await prisma.driver.findFirst({
      where: { 
        id: id,
        schoolId: schoolId
      }
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found or doesn't belong to this school"
      });
    }
    
    // Check if driver is assigned to any buses
    const assignedBuses = await prisma.bus.findMany({
      where: { driverId: id }
    });
    
    if (assignedBuses.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete driver as they are assigned to buses. Please unassign the driver first.",
        assignedBuses: assignedBuses.map(bus => ({
          id: bus.id,
          registrationNumber: bus.registrationNumber
        }))
      });
    }
    
    await prisma.driver.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: "Driver deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete driver",
      error: error.message
    });
  }
};

// ==================== BUS CONTROLLERS ====================

/**
 * Get all buses for a specific school
 */
export const getAllBuses = async (req, res) => {
  try {
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const buses = await prisma.bus.findMany({
      where: {
        schoolId: schoolId
      },
      include: {
        driver: true,
        route: true,
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      },
      orderBy: {
        registrationNumber: 'asc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
      schoolId: schoolId
    });
  } catch (error) {
    console.error("Error fetching buses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch buses",
      error: error.message
    });
  }
};

/**
 * Get a single bus by ID (with school validation)
 */
export const getBusById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }
    
    const bus = await prisma.bus.findFirst({
      where: { 
        id: id,
        schoolId: schoolId
      },
      include: {
        driver: true,
        route: true,
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found or doesn't belong to this school"
      });
    }
    
    res.status(200).json({
      success: true,
      data: bus
    });
  } catch (error) {
    console.error("Error fetching bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bus",
      error: error.message
    });
  }
};

/**
 * Create a new bus with school association
 */
export const createBus = async (req, res) => {
  try {
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const {
      registrationNumber,
      make,
      model,
      capacity,
      fuelType,
      purchaseDate,
      insuranceExpiryDate,
      lastMaintenanceDate,
      lastInspectionDate,
      currentOdometer,
      driverId,
      routeId,
      status,
      notes
    } = req.body;
    
    // Validate required fields - only make and capacity are required
    if (!make || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Please provide vehicle make and capacity"
      });
    }
    
    // Check if bus with the same registration number already exists in the same school (only if registrationNumber is provided)
    if (registrationNumber && registrationNumber.trim()) {
      const existingBus = await prisma.bus.findFirst({
        where: { 
          registrationNumber: registrationNumber.trim(),
          schoolId: schoolId
        }
      });
      
      if (existingBus) {
        return res.status(400).json({
          success: false,
          message: "Bus with this registration number already exists in this school"
        });
      }
    }

    // Validate driver belongs to the same school if provided
    if (driverId) {
      const driver = await prisma.driver.findFirst({
        where: {
          id: driverId,
          schoolId: schoolId
        }
      });

      if (!driver) {
        return res.status(400).json({
          success: false,
          message: "Driver not found or doesn't belong to this school"
        });
      }
    }

    // Validate route belongs to the same school if provided
    if (routeId) {
      const route = await prisma.route.findFirst({
        where: {
          id: routeId,
          schoolId: schoolId
        }
      });

      if (!route) {
        return res.status(400).json({
          success: false,
          message: "Route not found or doesn't belong to this school"
        });
      }
    }
    
    const bus = await prisma.bus.create({
      data: {
        id: uuidv4(),
        registrationNumber: registrationNumber && registrationNumber.trim() ? registrationNumber.trim() : null,
        make: make.trim(),
        model: model ? model.trim() : 'Unknown',
        capacity: parseInt(capacity),
        fuelType: fuelType ? fuelType.trim() : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        insuranceExpiryDate: insuranceExpiryDate ? new Date(insuranceExpiryDate) : null,
        lastMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate) : null,
        lastInspectionDate: lastInspectionDate ? new Date(lastInspectionDate) : null,
        currentOdometer: parseFloat(currentOdometer) || 0,
        driverId: driverId || null,
        routeId: routeId || null,
        status: status || 'ACTIVE',
        notes: notes ? notes.trim() : null,
        schoolId: schoolId
      },
      include: {
        driver: true,
        route: true,
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: bus,
      message: "Bus created successfully"
    });
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bus",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Update an existing bus
 */
export const updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      registrationNumber,
      make,
      model,
      capacity,
      fuelType,
      purchaseDate,
      insuranceExpiryDate,
      lastMaintenanceDate,
      lastInspectionDate,
      currentOdometer,
      driverId,
      routeId,
      status,
      notes
    } = req.body;
    
    // Check if bus exists
    const busExists = await prisma.bus.findUnique({
      where: { id }
    });
    
    if (!busExists) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (registrationNumber !== undefined) updateData.registrationNumber = registrationNumber;
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (fuelType !== undefined) updateData.fuelType = fuelType;
    if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
    if (insuranceExpiryDate !== undefined) updateData.insuranceExpiryDate = insuranceExpiryDate ? new Date(insuranceExpiryDate) : null;
    if (lastMaintenanceDate !== undefined) updateData.lastMaintenanceDate = lastMaintenanceDate ? new Date(lastMaintenanceDate) : null;
    if (lastInspectionDate !== undefined) updateData.lastInspectionDate = lastInspectionDate ? new Date(lastInspectionDate) : null;
    if (currentOdometer !== undefined) updateData.currentOdometer = parseFloat(currentOdometer) || 0;
    if (driverId !== undefined) updateData.driverId = driverId;
    if (routeId !== undefined) updateData.routeId = routeId;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    const bus = await prisma.bus.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      data: bus
    });
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bus",
      error: error.message
    });
  }
};

/**
 * Delete a bus
 */
export const deleteBus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if bus exists
    const bus = await prisma.bus.findUnique({
      where: { id }
    });
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
      });
    }
    
    // Check if bus is used in any trip
    const assignedTrip = await prisma.trip.findFirst({
      where: { busId: id }
    });
    
    if (assignedTrip) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete bus. Bus is assigned to a trip."
      });
    }
    
    await prisma.bus.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: "Bus deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete bus",
      error: error.message
    });
  }
};

// ==================== ROUTE CONTROLLERS ====================

/**
 * Get all routes for a specific school
 */
export const getAllRoutes = async (req, res) => {
  try {
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const routes = await prisma.route.findMany({
      where: {
        schoolId: schoolId
      },
      include: {
        bus: {
          include: {
            driver: true
          }
        },
        school: {
          select: {
            id: true,
            schoolName: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // If the bus relation isn't working, let's fetch buses separately and match them
    const buses = await prisma.bus.findMany({
      where: {
        schoolId: schoolId
      },
      include: {
        driver: true
      }
    });

    // Transform the data to ensure vehicle and driver info is available
    const transformedRoutes = routes.map(route => {
      let vehicleInfo = null;
      let driverInfo = null;

      // Try to get bus info from the included relation first
      if (route.bus) {
        vehicleInfo = {
          id: route.bus.id,
          vehicleName: route.bus.make,
          registrationNumber: route.bus.registrationNumber,
          make: route.bus.make,
          model: route.bus.model,
          capacity: route.bus.capacity
        };

        if (route.bus.driver) {
          driverInfo = {
            id: route.bus.driver.id,
            name: route.bus.driver.name,
            contactNumber: route.bus.driver.contactNumber,
            licenseNumber: route.bus.driver.licenseNumber
          };
        }
      } else if (route.busId) {
        // If relation doesn't work, find the bus manually
        const matchedBus = buses.find(bus => bus.id === route.busId);
        if (matchedBus) {
          vehicleInfo = {
            id: matchedBus.id,
            vehicleName: matchedBus.make,
            registrationNumber: matchedBus.registrationNumber,
            make: matchedBus.make,
            model: matchedBus.model,
            capacity: matchedBus.capacity
          };

          if (matchedBus.driver) {
            driverInfo = {
              id: matchedBus.driver.id,
              name: matchedBus.driver.name,
              contactNumber: matchedBus.driver.contactNumber,
              licenseNumber: matchedBus.driver.licenseNumber
            };
          }
        }
      }

      return {
        ...route,
        vehicle: vehicleInfo,
        driver: driverInfo,
        // Ensure we have the bus data structure for backward compatibility
        bus: vehicleInfo ? {
          ...vehicleInfo,
          driver: driverInfo
        } : null
      };
    });
    
    res.status(200).json({
      success: true,
      count: transformedRoutes.length,
      data: transformedRoutes,
      schoolId: schoolId
    });
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: error.message
    });
  }
};

/**
 * Get a single route by ID
 */
export const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        bus: {
          include: {
            driver: true
          }
        }
      }
    });
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    // Transform the route data to ensure vehicle and driver info is available
    let vehicleInfo = null;
    let driverInfo = null;

    // Try to get bus info from the included relation first
    if (route.bus) {
      vehicleInfo = {
        id: route.bus.id,
        vehicleName: route.bus.make,
        registrationNumber: route.bus.registrationNumber,
        make: route.bus.make,
        model: route.bus.model,
        capacity: route.bus.capacity
      };

      if (route.bus.driver) {
        driverInfo = {
          id: route.bus.driver.id,
          name: route.bus.driver.name,
          contactNumber: route.bus.driver.contactNumber,
          licenseNumber: route.bus.driver.licenseNumber
        };
      }
    } else if (route.busId) {
      // If relation doesn't work, find the bus manually
      const matchedBus = await prisma.bus.findUnique({
        where: { id: route.busId },
        include: {
          driver: true
        }
      });

      if (matchedBus) {
        vehicleInfo = {
          id: matchedBus.id,
          vehicleName: matchedBus.make,
          registrationNumber: matchedBus.registrationNumber,
          make: matchedBus.make,
          model: matchedBus.model,
          capacity: matchedBus.capacity
        };

        if (matchedBus.driver) {
          driverInfo = {
            id: matchedBus.driver.id,
            name: matchedBus.driver.name,
            contactNumber: matchedBus.driver.contactNumber,
            licenseNumber: matchedBus.driver.licenseNumber
          };
        }
      }
    }

    const transformedRoute = {
      ...route,
      vehicle: vehicleInfo,
      driver: driverInfo,
      // Ensure we have the bus data structure for backward compatibility
      bus: vehicleInfo ? {
        ...vehicleInfo,
        driver: driverInfo
      } : route.bus
    };
    
    res.status(200).json({
      success: true,
      data: transformedRoute
    });
  } catch (error) {
    console.error("Error fetching route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch route",
      error: error.message
    });
  }
};

/**
 * Create a new route
 */
export const createRoute = async (req, res) => {
  try {
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const {
      name,
      description,
      startLocation,
      endLocation,
      distance,
      estimatedTime,
      busId
    } = req.body;
    
    // Validate required fields
    if (!name || !startLocation || !endLocation) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, start location, and end location"
      });
    }

    // Validate bus belongs to the same school if provided
    if (busId) {
      const bus = await prisma.bus.findFirst({
        where: {
          id: busId,
          schoolId: schoolId
        }
      });

      if (!bus) {
        return res.status(400).json({
          success: false,
          message: "Bus not found or doesn't belong to this school"
        });
      }
    }
    
    const route = await prisma.route.create({
      data: {
        id: uuidv4(),
        name,
        description,
        startLocation,
        endLocation,
        distance: parseFloat(distance) || 0,
        estimatedTime: parseInt(estimatedTime) || 0,
        busId: busId || null,
        schoolId: schoolId // Include schoolId when creating route
      }
    });

    // Fetch the complete route data with bus and driver information
    let vehicleInfo = null;
    let driverInfo = null;

    if (busId) {
      const matchedBus = await prisma.bus.findUnique({
        where: { id: busId },
        include: {
          driver: true
        }
      });

      if (matchedBus) {
        vehicleInfo = {
          id: matchedBus.id,
          vehicleName: matchedBus.make,
          registrationNumber: matchedBus.registrationNumber,
          make: matchedBus.make,
          model: matchedBus.model,
          capacity: matchedBus.capacity
        };

        if (matchedBus.driver) {
          driverInfo = {
            id: matchedBus.driver.id,
            name: matchedBus.driver.name,
            contactNumber: matchedBus.driver.contactNumber,
            licenseNumber: matchedBus.driver.licenseNumber
          };
        }
      }
    }

    const transformedRoute = {
      ...route,
      vehicle: vehicleInfo,
      driver: driverInfo,
      // Ensure we have the bus data structure for backward compatibility
      bus: vehicleInfo ? {
        ...vehicleInfo,
        driver: driverInfo
      } : null
    };
    
    res.status(201).json({
      success: true,
      data: transformedRoute,
      message: "Route created successfully"
    });
  } catch (error) {
    console.error("Error creating route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create route",
      error: error.message
    });
  }
};

/**
 * Update an existing route
 */
export const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const {
      name,
      description,
      startLocation,
      endLocation,
      distance,
      estimatedTime,
      busId
    } = req.body;
    
    // Check if route exists and belongs to the school
    const routeExists = await prisma.route.findFirst({
      where: { 
        id: id,
        schoolId: schoolId
      }
    });
    
    if (!routeExists) {
      return res.status(404).json({
        success: false,
        message: "Route not found or doesn't belong to this school"
      });
    }

    // Validate bus belongs to the same school if provided
    if (busId) {
      const bus = await prisma.bus.findFirst({
        where: {
          id: busId,
          schoolId: schoolId
        }
      });

      if (!bus) {
        return res.status(400).json({
          success: false,
          message: "Bus not found or doesn't belong to this school"
        });
      }
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startLocation !== undefined) updateData.startLocation = startLocation;
    if (endLocation !== undefined) updateData.endLocation = endLocation;
    if (distance !== undefined) updateData.distance = parseFloat(distance);
    if (estimatedTime !== undefined) updateData.estimatedTime = parseInt(estimatedTime);
    if (busId !== undefined) updateData.busId = busId;
    
    const route = await prisma.route.update({
      where: { id },
      data: updateData
    });

    // Fetch the complete route data with bus and driver information
    let vehicleInfo = null;
    let driverInfo = null;

    if (route.busId) {
      const matchedBus = await prisma.bus.findUnique({
        where: { id: route.busId },
        include: {
          driver: true
        }
      });

      if (matchedBus) {
        vehicleInfo = {
          id: matchedBus.id,
          vehicleName: matchedBus.make,
          registrationNumber: matchedBus.registrationNumber,
          make: matchedBus.make,
          model: matchedBus.model,
          capacity: matchedBus.capacity
        };

        if (matchedBus.driver) {
          driverInfo = {
            id: matchedBus.driver.id,
            name: matchedBus.driver.name,
            contactNumber: matchedBus.driver.contactNumber,
            licenseNumber: matchedBus.driver.licenseNumber
          };
        }
      }
    }

    const transformedRoute = {
      ...route,
      vehicle: vehicleInfo,
      driver: driverInfo,
      // Ensure we have the bus data structure for backward compatibility
      bus: vehicleInfo ? {
        ...vehicleInfo,
        driver: driverInfo
      } : null
    };
    
    res.status(200).json({
      success: true,
      data: transformedRoute,
      message: "Route updated successfully"
    });
  } catch (error) {
    console.error("Error updating route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update route",
      error: error.message
    });
  }
};

/**
 * Delete a route
 */
export const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }
    
    // Check if route exists and belongs to the school
    const route = await prisma.route.findFirst({
      where: { 
        id: id,
        schoolId: schoolId
      }
    });
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found or doesn't belong to this school"
      });
    }
    
    // Check if route is used in any trip
    const assignedTrip = await prisma.trip.findFirst({
      where: { routeId: id }
    });
    
    if (assignedTrip) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete route. Route is assigned to a trip."
      });
    }
    
    await prisma.route.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: "Route deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete route",
      error: error.message
    });
  }
};

// ==================== TRIP CONTROLLERS ====================

/**
 * Get all trips
 */
export const getAllTrips = async (req, res) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        bus: true,
        route: true,
        driver: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trips",
      error: error.message
    });
  }
};

/**
 * Get a single trip by ID
 */
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        bus: true,
        route: true,
        driver: true
      }
    });
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trip",
      error: error.message
    });
  }
};

/**
 * Create a new trip
 */
export const createTrip = async (req, res) => {
  try {
    const {
      busId,
      routeId,
      driverId,
      date,
      startTime,
      endTime,
      status,
      startOdometer,
      endOdometer,
      notes,
      delayMinutes
    } = req.body;
    
    // Validate required fields
    if (!busId || !routeId || !driverId || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide bus ID, route ID, driver ID, and date"
      });
    }
    
    // CHECK IF ENTITIES EXIST FIRST
    const [busExists, routeExists, driverExists] = await Promise.all([
      prisma.bus.findUnique({ where: { id: busId } }),
      prisma.route.findUnique({ where: { id: routeId } }),
      prisma.driver.findUnique({ where: { id: driverId } })
    ]);
    
    if (!busExists) {
      return res.status(400).json({
        success: false,
        message: "Bus not found. Please create a bus first or provide a valid bus ID."
      });
    }
    
    if (!routeExists) {
      return res.status(400).json({
        success: false,
        message: "Route not found. Please create a route first or provide a valid route ID."
      });
    }
    
    if (!driverExists) {
      return res.status(400).json({
        success: false,
        message: "Driver not found. Please create a driver first or provide a valid driver ID."
      });
    }
    
    const trip = await prisma.trip.create({
      data: {
        id: uuidv4(),
        busId,
        routeId,
        driverId,
        date: new Date(date),
        startTime,
        endTime,
        status: status || 'SCHEDULED',
        startOdometer: parseFloat(startOdometer) || 0,
        endOdometer: endOdometer ? parseFloat(endOdometer) : null,
        notes,
        delayMinutes: parseInt(delayMinutes) || 0
      }
    });
    
    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create trip",
      error: error.message
    });
  }
};

/**
 * Update an existing trip
 */
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      busId,
      routeId,
      driverId,
      date,
      startTime,
      endTime,
      status,
      startOdometer,
      endOdometer,
      notes,
      delayMinutes
    } = req.body;
    
    // Check if trip exists
    const tripExists = await prisma.trip.findUnique({
      where: { id }
    });
    
    if (!tripExists) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (busId !== undefined) updateData.busId = busId;
    if (routeId !== undefined) updateData.routeId = routeId;
    if (driverId !== undefined) updateData.driverId = driverId;
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (status !== undefined) updateData.status = status;
    if (startOdometer !== undefined) updateData.startOdometer = parseFloat(startOdometer);
    if (endOdometer !== undefined) updateData.endOdometer = parseFloat(endOdometer);
    if (notes !== undefined) updateData.notes = notes;
    if (delayMinutes !== undefined) updateData.delayMinutes = parseInt(delayMinutes);
    
    const trip = await prisma.trip.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update trip",
      error: error.message
    });
  }
};

/**
 * Delete a trip
 */
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id }
    });
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }
    
    await prisma.trip.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: "Trip deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete trip",
      error: error.message
    });
  }
};

/**
 * Update trip status
 */
export const updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, endOdometer } = req.body;
    
    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id }
    });
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found"
      });
    }
    
    // Prepare update data
    const updateData = { status };
    
    // If trip is being completed, update the end odometer
    if (status === 'COMPLETED' && endOdometer) {
      updateData.endOdometer = parseFloat(endOdometer);
    }
    
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (error) {
    console.error("Error updating trip status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update trip status",
      error: error.message
    });
  }
};

// ==================== MAINTENANCE CONTROLLERS ====================

/**
 * Get all maintenance records
 */
export const getAllMaintenance = async (req, res) => {
  try {
    const maintenance = await prisma.maintenance.findMany({
      include: {
        bus: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: maintenance.length,
      data: maintenance
    });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance records",
      error: error.message
    });
  }
};

/**
 * Get a single maintenance record by ID
 */
export const getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const maintenance = await prisma.maintenance.findUnique({
      where: { id },
      include: {
        bus: true
      }
    });
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error("Error fetching maintenance record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance record",
      error: error.message
    });
  }
};

/**
 * Create a new maintenance record
 */
export const createMaintenance = async (req, res) => {
  try {
    const {
      busId,
      date,
      type,
      description,
      cost,
      odometer,
      nextDueDate,
      completedBy,
      status
    } = req.body;
    
    // Validate required fields
    if (!busId || !date || !type) {
      return res.status(400).json({
        success: false,
        message: "Please provide bus ID, date, and maintenance type"
      });
    }
    
    // CHECK IF BUS EXISTS FIRST
    const busExists = await prisma.bus.findUnique({
      where: { id: busId }
    });
    
    if (!busExists) {
      return res.status(400).json({
        success: false,
        message: "Bus not found. Please create a bus first or provide a valid bus ID."
      });
    }
    
    const maintenance = await prisma.maintenance.create({
      data: {
        id: uuidv4(),
        busId,
        date: new Date(date),
        type,
        description,
        cost: parseFloat(cost) || 0,
        odometer: parseFloat(odometer) || 0,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        completedBy,
        status: status || 'SCHEDULED'
      }
    });
    
    res.status(201).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create maintenance record",
      error: error.message
    });
  }
};

/**
 * Update an existing maintenance record
 */
export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      busId,
      date,
      type,
      description,
      cost,
      odometer,
      nextDueDate,
      completedBy,
      status
    } = req.body;
    
    // Check if maintenance record exists
    const maintenanceExists = await prisma.maintenance.findUnique({
      where: { id }
    });
    
    if (!maintenanceExists) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (busId !== undefined) updateData.busId = busId;
    if (date !== undefined) updateData.date = new Date(date);
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (odometer !== undefined) updateData.odometer = parseFloat(odometer);
    if (nextDueDate !== undefined) updateData.nextDueDate = nextDueDate ? new Date(nextDueDate) : null;
    if (completedBy !== undefined) updateData.completedBy = completedBy;
    if (status !== undefined) updateData.status = status;
    
    const maintenance = await prisma.maintenance.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update maintenance record",
      error: error.message
    });
  }
};

/**
 * Delete a maintenance record
 */
export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if maintenance record exists
    const maintenance = await prisma.maintenance.findUnique({
      where: { id }
    });
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance record not found"
      });
    }
    
    await prisma.maintenance.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: "Maintenance record deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting maintenance record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete maintenance record",
      error: error.message
    });
  }
};

// ==================== STUDENT TRANSPORT CONTROLLERS ====================

/**
 * Get all student transport records for a specific school
 */
export const getAllStudentTransport = async (req, res) => {
  try {
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const studentTransport = await prisma.studentTransport.findMany({
      where: {
        // Filter by routes that belong to the school
        route: {
          schoolId: schoolId
        }
      },
      include: {
        student: {
          select: {
            fullName: true,
            admissionNo: true,
            schoolId: true,
            sessionInfo: {
              select: {
                currentClass: true,
                currentSection: true
              }
            }
          }
        },
        route: {
          select: {
            id: true,
            name: true,
            schoolId: true
          }
        }
      },
      orderBy: {
        pickupTime: 'asc'
      }
    });
    
    // Additional filtering to ensure students belong to the same school
    const filteredStudentTransport = studentTransport.filter(record => 
      record.student && record.student.schoolId === schoolId
    );
    
    res.status(200).json({
      success: true,
      count: filteredStudentTransport.length,
      data: filteredStudentTransport,
      schoolId: schoolId
    });
  } catch (error) {
    console.error("Error fetching student transport records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student transport records",
      error: error.message
    });
  }
};

/**
 * Get students by route (with school validation)
 */
export const getStudentsByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    // Validate that the route belongs to the school
    const route = await prisma.route.findFirst({
      where: {
        id: routeId,
        schoolId: schoolId
      }
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found or doesn't belong to this school"
      });
    }
    
    const students = await prisma.studentTransport.findMany({
      where: { routeId },
      include: {
        student: {
          select: {
            fullName: true,
            admissionNo: true,
            schoolId: true,
            sessionInfo: {
              select: {
                currentClass: true,
                currentSection: true
              }
            }
          }
        }
      },
      orderBy: {
        pickupTime: 'asc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error("Error fetching students by route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students by route",
      error: error.message
    });
  }
};

/**
 * Assign student to a route (with school validation)
 */
export const assignStudentToRoute = async (req, res) => {
  try {
    // Get and validate school ID
    const { schoolId, error } = await getAndValidateSchoolId(req);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const {
      studentId,
      routeId,
      pickupLocation,
      dropLocation,
      pickupTime,
      dropTime,
      fee
    } = req.body;
    
    // Validate required fields
    if (!studentId || !routeId || !pickupLocation || !dropLocation) {
      return res.status(400).json({
        success: false,
        message: "Please provide student ID, route ID, pickup location, and drop location"
      });
    }
    
    // CHECK IF ENTITIES EXIST AND BELONG TO THE SCHOOL
    const [routeExists, studentExists] = await Promise.all([
      prisma.route.findFirst({ 
        where: { 
          id: routeId,
          schoolId: schoolId
        } 
      }),
      prisma.student.findFirst({ 
        where: { 
          admissionNo: studentId,
          schoolId: schoolId
        } 
      })
    ]);
    
    if (!routeExists) {
      return res.status(400).json({
        success: false,
        message: "Route not found or doesn't belong to this school. Please create a route first or provide a valid route ID."
      });
    }
    
    if (!studentExists) {
      return res.status(400).json({
        success: false,
        message: "Student not found or doesn't belong to this school. The admission number provided does not match any student in this school."
      });
    }
    
    // Check if student is already assigned to a route
    const existingAssignment = await prisma.studentTransport.findFirst({
      where: { studentId: studentExists.id }
    });
    
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: "Student is already assigned to a route"
      });
    }
    
    const studentTransport = await prisma.studentTransport.create({
      data: {
        id: uuidv4(),
        studentId: studentExists.id, // Use the actual student ID from database
        routeId,
        pickupLocation,
        dropLocation,
        pickupTime,
        dropTime,
        fee: parseFloat(fee) || 0
      },
      include: {
        student: {
          select: {
            fullName: true,
            admissionNo: true,
            schoolId: true
          }
        },
        route: true
      }
    });
    
    res.status(201).json({
      success: true,
      data: studentTransport,
      message: "Student assigned to route successfully"
    });
  } catch (error) {
    console.error("Error assigning student to route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign student to route",
      error: error.message
    });
  }
};

/**
 * Update student transport record
 */
export const updateStudentTransport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      routeId,
      pickupLocation,
      dropLocation,
      pickupTime,
      dropTime,
      fee
    } = req.body;
    
    // Check if record exists
    const recordExists = await prisma.studentTransport.findUnique({
      where: { id }
    });
    
    if (!recordExists) {
      return res.status(404).json({
        success: false,
        message: "Student transport record not found"
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (routeId !== undefined) updateData.routeId = routeId;
    if (pickupLocation !== undefined) updateData.pickupLocation = pickupLocation;
    if (dropLocation !== undefined) updateData.dropLocation = dropLocation;
    if (pickupTime !== undefined) updateData.pickupTime = pickupTime;
    if (dropTime !== undefined) updateData.dropTime = dropTime;
    if (fee !== undefined) updateData.fee = parseFloat(fee);
    
    const studentTransport = await prisma.studentTransport.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      data: studentTransport
    });
  } catch (error) {
    console.error("Error updating student transport record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student transport record",
      error: error.message
    });
  }
};

/**
 * Remove student from route
 */
export const removeStudentFromRoute = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const record = await prisma.studentTransport.findUnique({
      where: { id }
    });
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Student transport record not found"
      });
    }
    
    await prisma.studentTransport.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: "Student removed from route successfully"
    });
  } catch (error) {
    console.error("Error removing student from route:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove student from route",
      error: error.message
    });
  }
};

// ==================== SCHOOL CONTROLLERS ====================

/**
 * Get school information
 */
export const getSchoolInfo = async (req, res) => {
  try {
    console.log('Fetching school information from database...');
    
    // Get and validate school ID from request or use the first available school
    const { schoolId, error } = await getAndValidateSchoolId(req);
    
    let school = null;
    let schoolInfo = null;
    
    if (error) {
      // If no school found in database, return null schoolId
      console.log('No school found in database:', error);
      return res.status(200).json({
        success: true,
        data: {
          id: null,
          schoolName: null,
          address: null,
          phone: null,
          contact: null,
          email: null,
          principal: null,
          established: null,
          image_url: null
        },
        message: "No school found in database"
      });
    }
    
    // Fetch the specific school from the database
    school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        schoolName: true,
        address: true,
        contact: true,
        phone: true,
        email: true,
        principal: true,
        established: true,
        image_url: true,
        status: true
      }
    });
    
    console.log('School data from database:', school);
    
    // Transform the school data to match the expected format
    if (school) {
      schoolInfo = {
        id: school.id,
        schoolName: school.schoolName || '',
        address: school.address || '',
        phone: school.phone || '',
        contact: school.contact ? school.contact.toString() : school.phone || '',
        email: school.email || '',
        principal: school.principal || null,
        established: school.established || null,
        image_url: school.image_url || null,
        status: school.status || 'active'
      };
    } else {
      console.log('School not found with ID:', schoolId);
      // Return null values if school not found
      schoolInfo = {
        id: null,
        schoolName: null,
        address: null,
        phone: null,
        contact: null,
        email: null,
        principal: null,
        established: null,
        image_url: null,
        status: null
      };
    }
    
    console.log('Returning school info:', schoolInfo);
    
    res.status(200).json({
      success: true,
      data: schoolInfo,
      message: school ? "School information retrieved successfully" : "School not found"
    });
  } catch (error) {
    console.error("Error fetching school info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch school information",
      error: error.message,
      data: {
        id: null,
        schoolName: null,
        address: null,
        phone: null,
        contact: null,
        email: null,
        principal: null,
        established: null,
        image_url: null,
        status: null
      }
    });
  }
}; 