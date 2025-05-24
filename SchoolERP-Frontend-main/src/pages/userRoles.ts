// src/config/userRoles.ts

export const userRoles = {
    admin: {
      routePermissions: [
        '/dashboard',
        '/students',
        '/fee-structure',
        '/Attendence',
        '/notifications',
        '/reports',
        '/AccountPage',
        '/StudentRegistrationForm',
        '/student-fee/:id',
        '/payment/:studentId',
        '/users',
        '/users/:id',
        '/users/:id/edit',
        '/profile'
      ],
      uiPermissions: [
        'admin_menu',
        'manage_users',
        'create_students',
        'edit_all_users',
        'manage_fee_structures',
        'view_financial_reports'
      ]
    },
    school: {
      routePermissions: [
        '/dashboard',
        '/students',
        '/fee-structure',
        '/Attendence',
        '/notifications',
        '/reports',
        '/AccountPage',
        '/StudentRegistrationForm',
        '/student-fee/:id',
        '/payment/:studentId',
        '/users/:id',
        '/profile'
      ],
      uiPermissions: [
        'school_menu',
        'create_students',
        'manage_students',
        'manage_fee_structures',
        'view_reports'
      ]
    },
    teacher: {
      routePermissions: [
        '/dashboard',
        '/students',
        '/fee-structure',
        '/Attendence',
        '/notifications',
        '/reports',
        '/profile'
      ],
      uiPermissions: [
        'teacher_menu',
        'view_students',
        'view_attendance',
        'submit_grades'
      ]
    },
    user: {
      routePermissions: [
        '/dashboard',
        '/profile',
        '/student-fee/:id',
        '/payment/:studentId'
      ],
      uiPermissions: [
        'student_menu',
        'view_own_profile',
        'make_payments',
        'view_fee_details'
      ]
    }
  };
  
  export type UserRole = keyof typeof userRoles;