export const teacherSchemas = {
    NewTeacher: {
      type: 'object',
      required: ['user', 'teacher'],
      properties: {
        user: {
          type: 'object',
          required: ['firstName', 'lastName', 'dob', 'email', 'password', 'address', 'postalCode', 'phoneNumber'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            dob: { type: 'string', format: 'date', example: '1990-01-01' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'Password123!' },
            address: { type: 'string', example: '123 Main St' },
            postalCode: { type: 'string', example: '12345' },
            phoneNumber: { type: 'string', example: '+1234567890' },
          },
        },
        teacher: {
          type: 'object',
          required: ['employeeNumber', 'idNumber', 'taxNumber', 'contractStartDate', 'contractEndDate', 'hourlyRate', 'bank', 'iban', 'bic'],
          properties: {
            employeeNumber: { type: 'string', example: 'EMP123' },
            idNumber: { type: 'string', example: 'ID456789' },
            taxNumber: { type: 'string', example: 'TAX789456' },
            contractStartDate: { type: 'string', format: 'date', example: '2024-01-01' },
            contractEndDate: { type: 'string', format: 'date', example: '2025-01-01' },
            hourlyRate: { type: 'number', example: 50 },
            bank: { type: 'string', example: 'Bank of Examples' },
            iban: { type: 'string', example: 'GB33BUKB20201555555555' },
            bic: { type: 'string', example: 'BUKBGB22' },
          },
        },
      },
    },
    Teacher: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        user: { $ref: '#/components/schemas/UserDto' },
        employeeNumber: { type: 'string', example: 'EMP123' },
        idNumber: { type: 'string', example: 'ID456789' },
        taxNumber: { type: 'string', example: 'TAX789456' },
        contractStartDate: { type: 'string', format: 'date', example: '2024-01-01' },
        contractEndDate: { type: 'string', format: 'date', example: '2025-01-01' },
        hourlyRate: { type: 'number', example: 50 },
        bank: { type: 'string', example: 'Bank of Examples' },
        iban: { type: 'string', example: 'GB33BUKB20201555555555' },
        bic: { type: 'string', example: 'BUKBGB22' },
        
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
  
