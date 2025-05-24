import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import axios from 'axios';

// Create a new prisma client instance with proper error handling
let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  // Create a fallback object with empty methods to prevent crashes
  prisma = {
    driver: { findMany: async () => [] },
    bus: { findMany: async () => [] },
    route: { findMany: async () => [] },
    trip: { findMany: async () => [] },
    maintenance: { findMany: async () => [] },
    studentTransport: { findMany: async () => [] }
  };
}

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
 * Get all drivers
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

    const drivers = await prisma.driver.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
      error: error.message
    });
  }
};

/**
 * Get a single driver by ID
 */
export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const driver = await prisma.driver.findUnique({
      where: { id }
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
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
 * Create a new driver
 */
export const createDriver = async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      contactNumber,
      address,
      experience,
      joiningDate,
      isActive
    } = req.body;
    
    // Validate required fields
    if (!name || !licenseNumber || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, license number, and contact number"
      });
    }
    
    // Check if driver with the same license number already exists
    const existingDriver = await prisma.driver.findFirst({
      where: { licenseNumber }
    });
    
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "Driver with this license number already exists"
      });
    }
    
    const driver = await prisma.driver.create({
      data: {
        id: uuidv4(),
        name,
        licenseNumber,
        contactNumber,
        address,
        experience: parseInt(experience) || 0,
        joiningDate: new Date(joiningDate),
        isActive: Boolean(isActive)
      }
    });
    
    res.status(201).json({
      success: true,
      data: driver
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
 * Update an existing driver
 */
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      licenseNumber,
      contactNumber,
      address,
      experience,
      joiningDate,
      isActive
    } = req.body;
    
    // Check if driver exists
    const driverExists = await prisma.driver.findUnique({
      where: { id }
    });
    
    if (!driverExists) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (address !== undefined) updateData.address = address;
    if (experience !== undefined) updateData.experience = parseInt(experience) || 0;
    if (joiningDate !== undefined) updateData.joiningDate = new Date(joiningDate);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    
    const driver = await prisma.driver.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update driver",
      error: error.message
    });
  }
};

/**
 * Delete a driver
 */
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { id }
    });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }
    
    // Check if driver is assigned to any bus
    const assignedBus = await prisma.bus.findFirst({
      where: { driverId: id }
    });
    
    if (assignedBus) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete driver. Driver is assigned to a bus."
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
 * Get all buses
 */
export const getAllBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        driver: true,
        route: true
      },
      orderBy: {
        registrationNumber: 'asc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: buses.length,
      data: buses
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
 * Get a single bus by ID
 */
export const getBusById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bus = await prisma.bus.findUnique({
      where: { id },
      include: {
        driver: true,
        route: true
      }
    });
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found"
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
 * Create a new bus
 */
export const createBus = async (req, res) => {
  try {
    const {
      registrationNumber,
      make,
      model,
      capacity,
      fuelType,
      purchaseDate,
      insuranceExpiryDate,
      driverId,
      routeId,
      status
    } = req.body;
    
    // Validate required fields
    if (!registrationNumber || !make || !model || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Please provide registration number, make, model, and capacity"
      });
    }
    
    // Check if bus with the same registration number already exists
    const existingBus = await prisma.bus.findFirst({
      where: { registrationNumber }
    });
    
    if (existingBus) {
      return res.status(400).json({
        success: false,
        message: "Bus with this registration number already exists"
      });
    }
    
    const bus = await prisma.bus.create({
      data: {
        id: uuidv4(),
        registrationNumber,
        make,
        model,
        capacity: parseInt(capacity),
        fuelType,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        insuranceExpiryDate: insuranceExpiryDate ? new Date(insuranceExpiryDate) : null,
        driverId,
        routeId,
        status: status || 'ACTIVE'
      }
    });
    
    res.status(201).json({
      success: true,
      data: bus
    });
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bus",
      error: error.message
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
      driverId,
      routeId,
      status
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
    if (purchaseDate !== undefined) updateData.purchaseDate = new Date(purchaseDate);
    if (insuranceExpiryDate !== undefined) updateData.insuranceExpiryDate = new Date(insuranceExpiryDate);
    if (driverId !== undefined) updateData.driverId = driverId;
    if (routeId !== undefined) updateData.routeId = routeId;
    if (status !== undefined) updateData.status = status;
    
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
 * Get all routes
 */
export const getAllRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        bus: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
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
        bus: true
      }
    });
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: route
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
    
    const route = await prisma.route.create({
      data: {
        id: uuidv4(),
        name,
        description,
        startLocation,
        endLocation,
        distance: parseFloat(distance) || 0,
        estimatedTime: parseInt(estimatedTime) || 0,
        busId
      }
    });
    
    res.status(201).json({
      success: true,
      data: route
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
    const {
      name,
      description,
      startLocation,
      endLocation,
      distance,
      estimatedTime,
      busId
    } = req.body;
    
    // Check if route exists
    const routeExists = await prisma.route.findUnique({
      where: { id }
    });
    
    if (!routeExists) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
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
    
    res.status(200).json({
      success: true,
      data: route
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
    
    // Check if route exists
    const route = await prisma.route.findUnique({
      where: { id }
    });
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
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
 * Get all student transport records
 */
export const getAllStudentTransport = async (req, res) => {
  try {
    const studentTransport = await prisma.studentTransport.findMany({
      include: {
        student: {
          select: {
            fullName: true,
            admissionNo: true,
            className: true,
            section: true
          }
        },
        route: true
      },
      orderBy: {
        pickupTime: 'asc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: studentTransport.length,
      data: studentTransport
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
 * Get students by route
 */
export const getStudentsByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    
    const students = await prisma.studentTransport.findMany({
      where: { routeId },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            admissionNo: true,
            className: true,
            section: true
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
 * Assign student to a route
 */
export const assignStudentToRoute = async (req, res) => {
  try {
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
    
    // CHECK IF ENTITIES EXIST FIRST
    const [routeExists, studentExists] = await Promise.all([
      prisma.route.findUnique({ where: { id: routeId } }),
      prisma.student.findUnique({ where: { admissionNo: studentId } })
    ]);
    
    if (!routeExists) {
      return res.status(400).json({
        success: false,
        message: "Route not found. Please create a route first or provide a valid route ID."
      });
    }
    
    if (!studentExists) {
      return res.status(400).json({
        success: false,
        message: "Student not found. The admission number provided does not match any student."
      });
    }
    
    // Check if student is already assigned to a route
    const existingAssignment = await prisma.studentTransport.findFirst({
      where: { studentId }
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
        studentId,
        routeId,
        pickupLocation,
        dropLocation,
        pickupTime,
        dropTime,
        fee: parseFloat(fee) || 0
      }
    });
    
    res.status(201).json({
      success: true,
      data: studentTransport
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