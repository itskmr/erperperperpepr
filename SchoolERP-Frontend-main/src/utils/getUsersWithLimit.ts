// Define the UserData type
type UserData = {
  id: number;
  name: string;
  email: string;
  // Add other fields as needed
};

// Define the cache type
type PageCache = Map<number, UserData[]>; // Cache for pages

// Global cache and loading state
const cache: PageCache = new Map(); // Cache to store fetched user data
let loading = false; // Global loading state

export const fetchUsers = async (pageNumber: number): Promise<UserData[] | undefined> => {
  const usersPerPage = 10; // Number of users per page

  // Check if the page data is already in the cache
  if (cache.has(pageNumber)) {
    console.log("Using cached data for page", pageNumber);
    return cache.get(pageNumber);
  }

  // Fetch data from the server
  loading = true;
  try {
    const response = await fetch(
      `http://localhost:5000/api/admin/users?page=${pageNumber}&limit=${usersPerPage}`
    );
    const data = await response.json();

    if (data.success) {
      console.log("Fetched data for page", pageNumber);
      // Update the cache with the new data
      cache.set(pageNumber, data.data);
      return data.data;
    } else {
      console.error("Failed to fetch users:", data.message);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    loading = false;
  }
};

export const clearCache = (): void => {
  cache.clear();
  console.log("Cache cleared");
};
export const getLoadingState = (): boolean => loading;
export const getCache = (): PageCache => cache;