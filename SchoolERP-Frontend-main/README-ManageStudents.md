# ManageStudents Component

This document provides information about the ManageStudents component and how to troubleshoot common issues.

## Component Structure

The ManageStudents feature consists of the following files:

1. `src/pages/ManageStudents.tsx` - The main component that displays the student management interface
2. `src/components/ManageStudents/StudentTable.tsx` - The table component that displays student data
3. `src/components/ManageStudents/Pagination.tsx` - The pagination component for navigating between pages of students
4. `src/hooks/useStudentManagement.ts` - The custom hook that handles data fetching and state management

## API Integration

The component uses the following API endpoints:

- `GET /api/students` - Retrieves a list of students with pagination
- `DELETE /api/students/:id` - Deletes a student by ID

These endpoints are defined in `src/config/api.ts`.

## Troubleshooting

### Export/Import Issues

If you encounter errors related to exports or imports, make sure:

1. The component names match between the export and import statements
2. All components have both named and default exports:
   ```typescript
   export const ComponentName = () => { ... };
   export default ComponentName;
   ```
3. Imports use the correct syntax:
   ```typescript
   import { ComponentName } from './path/to/component';
   // or
   import ComponentName from './path/to/component';
   ```

### API Connection Issues

If the component is not fetching data correctly:

1. Check the browser console for error messages
2. Verify that the backend server is running
3. Ensure the API endpoints are correctly defined in `src/config/api.ts`
4. Check that CORS is properly configured on the backend

### Debugging Tips

The component includes console logs that output:
- Current students data
- Pagination information
- Loading state
- Error state

These logs can help identify where issues might be occurring.

## Backend Routes

The backend routes for student management are defined in:
- `server/src/routes/studentRoutes.js`

And are mounted in the Express application at:
- `/api/students`
- `/student`
- `/students`

Make sure these routes are working correctly by testing them directly with a tool like Postman or curl. 