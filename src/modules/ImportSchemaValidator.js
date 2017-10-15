import { Validator } from 'jsonschema';

export class ImportValidator {
    constructor() {
        this.validator = new Validator();

        const solveSchema = {
            'id': '/Solve',
            'type': 'object',
            'properties': {
                'penalty': { 'type': 'string', 'pattern': '|\\+2|dnf' },
                'scramble': { 'type': 'string' },
                'time': { 'type': 'integer', 'minimum': 1 },
                'timestamp': { 'type': 'integer', 'minimum': 1000000000000 }
            },
            'required': [ 'penalty', 'scramble', 'time', 'timestamp' ],
            'additionalProperties': false
        };

        const categorySchema = {
            'id': '/Category',
            'type': 'object',
            'patternProperties': {
                '.*': {
                    'type': 'array',
                    'items': { '$ref': '/Solve' }
                }
            }
        };

        const puzzleSchema = {
            'id': '/Puzzle',
            'type': 'object',
            'patternProperties': {
                '.*': { '$ref': '/Category' }
            }
        };

        const sessionSchema = {
            'id': '/Session',
            'type': 'object',
            'patternProperties': {
                '([2-9]|1[0-2]?)/([1-9]|[1-2][0-9]|3[0-1])/(20\\d{2})': { '$ref': '/Puzzle' }
            },
            'additionalProperties': false
        };

        this.validator.addSchema(solveSchema, '/Solve');
        this.validator.addSchema(categorySchema, '/Category');
        this.validator.addSchema(puzzleSchema, '/Puzzle');
        this.schema = sessionSchema;
    }

    validate(inputData) {
        return this.validator.validate(inputData, this.schema);
    }
}