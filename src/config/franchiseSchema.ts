

export const franchiseSchema ={Franchise: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
      },
      name: {
        type: 'string',
        example: 'Franchise Name',
      },
      ownerName: {
        type: 'string',
        example: 'John Doe',
      },
      cardHolderName: {
        type: 'string',
        example: 'John Doe',
      },
      iban: {
        type: 'string',
        example: 'DE89 3704 0044 0532 0130 00',
      },
      bic: {
        type: 'string',
        example: 'BYLADEM1001',
      },
      status: {
        type: 'string',
        example: 'Active',
      },
      totalEmployees: {
        type: 'integer',
        example: 100,
      },
      admins: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/User',
        },
      },
      locations: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Location',
        },
      },
    },
  },
  NewFranchise: {
    type: 'object',
    required: [
      'name',
      'ownerName',
      'cardHolderName',
      'iban',
      'bic',
      'status',
      'totalEmployees',
    ],
    properties: {
      name: {
        type: 'string',
        example: 'Franchise Name',
      },
      ownerName: {
        type: 'string',
        example: 'John Doe',
      },
      cardHolderName: {
        type: 'string',
        example: 'John Doe',
      },
      iban: {
        type: 'string',
        example: 'DE89 3704 0044 0532 0130 00',
      },
      bic: {
        type: 'string',
        example: 'BYLADEM1001',
      },
      status: {
        type: 'string',
        example: 'Active',
      },
      totalEmployees: {
        type: 'integer',
        example: 100,
      },
    },
  },
  UpdateFranchise: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      ownerName: {
        type: 'string',
      },
      cardHolderName: {
        type: 'string',
      },
      iban: {
        type: 'string',
      },
      bic: {
        type: 'string',
      },
      status: {
        type: 'string',
      },
      totalEmployees: {
        type: 'integer',
      },
    },
  },}
