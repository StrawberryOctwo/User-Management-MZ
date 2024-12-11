export const locationSchemas = {
    Location: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
        name: {
          type: 'string',
        },
        address: {
          type: 'string',
        },
        franchise: {
          $ref: '#/components/schemas/Franchise',
        },
        admins: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/User',
          },
        },
        teachers: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Teacher',
          },
        },
        students: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Student',
          },
        },
        classSessions: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ClassSession',
          },
        },
      },
    },
    NewLocation: {
      type: 'object',
      required: ['name', 'address', 'franchiseId'],
      properties: {
        name: {
          type: 'string',
        },
        address: {
          type: 'string',
        },
        franchiseId: {
          type: 'integer',
        },
      },
    },
    
  };
  
