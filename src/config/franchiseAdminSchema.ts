export const franchiseAdminSchema = {
    FranchiseAdmin: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
        },
        firstName: {
          type: 'string',
          example: 'John',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
        },
        dob: {
          type: 'string',
          format: 'date',
          example: '1980-01-01',
        },
        email: {
          type: 'string',
          example: 'john.doe@example.com',
        },
        address: {
          type: 'string',
          example: '123 Main St',
        },
        postalCode: {
          type: 'string',
          example: '12345',
        },
        phoneNumber: {
          type: 'string',
          example: '+1234567890',
        },
        roles: {
          type: 'array',
          items: {
            type: 'string',
            example: 'FranchiseAdmin',
          },
        },
      },
    },
    NewFranchiseAdmin: {
      type: 'object',
      required: [
        'firstName',
        'lastName',
        'dob',
        'email',
        'password',
        'address',
        'postalCode',
        'phoneNumber',
        'franchiseId',
      ],
      properties: {
        firstName: {
          type: 'string',
          example: 'John',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
        },
        dob: {
          type: 'string',
          format: 'date',
          example: '1980-01-01',
        },
        email: {
          type: 'string',
          example: 'john.doe@example.com',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
        address: {
          type: 'string',
          example: '123 Main St',
        },
        postalCode: {
          type: 'string',
          example: '12345',
        },
        phoneNumber: {
          type: 'string',
          example: '+1234567890',
        },
        franchiseId: {
          type: 'integer',
          example: 1,
        },
      },
    },
    UpdateFranchiseAdmin: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
        dob: {
          type: 'string',
          format: 'date',
        },
        email: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
        address: {
          type: 'string',
        },
        postalCode: {
          type: 'string',
        },
        phoneNumber: {
          type: 'string',
        },
      },
    },
    
  };
  
