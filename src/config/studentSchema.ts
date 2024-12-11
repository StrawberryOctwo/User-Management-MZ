export const studentSchemas = {
    NewStudent: {
      type: 'object',
      required: ['user', 'student'],
      properties: {
        user: {
          type: 'object',
          required: ['firstName', 'lastName', 'dob', 'email', 'password', 'address', 'postalCode', 'phoneNumber'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            dob: { type: 'string', format: 'date', example: '2005-05-20' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'Password123!' },
            address: { type: 'string', example: '123 Main St' },
            postalCode: { type: 'string', example: '12345' },
            phoneNumber: { type: 'string', example: '+1234567890' },
          },
        },
        student: {
          type: 'object',
          required: ['payPerHour', 'status', 'gradeLevel', 'contractType', 'contractEndDate', 'locationId', 'parentId'],
          properties: {
            payPerHour: { type: 'number', example: 20 },
            status: { type: 'string', example: 'Active' },
            gradeLevel: { type: 'integer', example: 10 },
            contractType: { type: 'string', example: 'Full-Time' },
            contractEndDate: { type: 'string', format: 'date', example: '2025-05-20' },
            notes: { type: 'string', example: 'Highly motivated student' },
            availableDates: { type: 'string', example: 'Monday, Wednesday' },
            locationId: { type: 'integer', example: 1 },
            parentId: { type: 'integer', example: 2 },
          },
        },
      },
    },
    Student: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        payPerHour: { type: 'number', example: 20 },
        status: { type: 'string', example: 'Active' },
        gradeLevel: { type: 'integer', example: 10 },
        contractType: { type: 'string', example: 'Full-Time' },
        contractEndDate: { type: 'string', format: 'date', example: '2025-05-20' },
        notes: { type: 'string', example: 'Highly motivated student' },
        availableDates: { type: 'string', example: 'Monday, Wednesday' },
        user: { $ref: '#/components/schemas/UserDto' },
        location: { type: 'object', example: { id: 1, name: 'Main Campus' } },
        parent: { type: 'object', example: { id: 2, name: 'Jane Doe' } },
        
      },
    },
    UserDto: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
        
      },
    },
    
  };
  
