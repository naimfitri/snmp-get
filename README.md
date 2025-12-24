# SNMP Monitoring Service

A NestJS-based SNMP monitoring application that provides multiple interfaces for querying SNMP agents. This service supports SNMPv2c and SNMPv3 protocols with comprehensive logging and monitoring capabilities.

## Overview

This application provides two main modules for SNMP operations:

1. **SNMP Module** - Direct SNMP library integration using net-snmp
2. **SNMP-CMD Module** - Command-line based SNMP queries using system snmp tools

## Project Structure

```
src/
├── snmp/                    # Direct SNMP library module
│   ├── snmp.controller.ts   # SNMP API endpoints
│   ├── snmp.service.ts      # SNMP query logic
│   ├── snmp.module.ts       # Module definition
│   ├── dto/
│   │   ├── snmp.get.dto.ts  # SNMPv2c request DTO
│   │   └── snmpV3.get.dto.ts # SNMPv3 request DTO
│   └── schema/
│       └── snmp.log.schema.ts # MongoDB logging schemas
├── snmp-cmd/                # Command-line SNMP module
│   ├── snmp-cmd.controller.ts
│   ├── snmp-cmd.service.ts
│   ├── snmp-cmd.module.ts
│   ├── dto/
│   │   └── snmp.request.dto.ts
│   └── schema/
│       └── snmp-cmd.log.schema.ts
└── app.module.ts            # Main application module
```

## Installation

```bash
npm install
```

## Setup & Configuration

### Environment Variables

Create a `.env` file or set environment variables for MongoDB connection:

```bash
MONGODB_URI=mongodb://localhost:27017/snmp
```

### Docker Compose (Testing)

The project includes Docker Compose configuration for SNMP simulator containers:

```bash
docker-compose up
```

This sets up:
- **SNMPv2c** simulator on port 161 (community: `pendekarkambing`)
- **SNMPv3** simulator on port 1161 (user: `pendekarayam`)

## Running the Application

### Development Mode

```bash
npm run start:dev
```

Server runs on `http://localhost:3000` with hot-reload enabled.

### Production Mode

```bash
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## API Documentation

### SNMP Module

#### SNMPv2c GET Request

**Endpoint:** `POST /snmp/getSnmpV2`

**Description:** Query multiple SNMP hosts simultaneously using SNMPv2c protocol.

**Request Body:**
```json
{
  "hosts": [
    {
      "host": "127.0.0.1",
      "community": "public",
      "port": 2161
    }
  ],
  "oids": [
    "1.3.6.1.2.1.1.1.0",
    "1.3.6.1.2.1.1.3.0"
  ]
}
```

**Response:**
```json
{
  "127.0.0.1:public": {
    "community": "public",
    "data": {
      "reachable": true,
      "responseTimeMs": 15,
      "data": [
        {
          "oid": "1.3.6.1.2.1.1.1.0",
          "value": "Linux localhost 5.15.0"
        }
      ]
    }
  }
}
```

#### SNMPv3 GET Request

**Endpoint:** `POST /snmp/getSnmpV3`

**Description:** Query SNMP hosts using SNMPv3 protocol with authentication and privacy options.

**Request Body:**
```json
{
  "host": "127.0.0.1",
  "port": 1161,
  "username": "pendekarayam",
  "authProtocol": "SHA256",
  "authPassword": "pendekarayam",
  "privProtocol": "DES",
  "privPassword": "pendekarayam",
  "securityLevel": "authPriv",
  "oids": [
    "1.3.6.1.2.1.1.1.0"
  ]
}
```

**Response:**
```json
[
  {
    "oid": "1.3.6.1.2.1.1.1.0",
    "value": "Linux localhost 5.15.0"
  }
]
```

### SNMP-CMD Module

#### Get SNMP Values

**Endpoint:** `POST /snmp-cmd/get`

**Description:** Retrieve SNMP values using command-line snmpget utility.

**Request Body:**
```json
{
  "ip": "192.168.1.1",
  "community": "public",
  "oids": [
    "1.3.6.1.2.1.1.1.0",
    "1.3.6.1.2.1.1.3.0"
  ]
}
```

**Response:**
```json
{
  "192.168.1.1:public": {
    "community": "public",
    "data": {
      "reachable": true,
      "responseTimeMs": 23,
      "data": [
        {
          "oid": "1.3.6.1.2.1.1.1.0",
          "value": "Linux router 5.15.0"
        },
        {
          "oid": "1.3.6.1.2.1.1.3.0",
          "value": "1233456"
        }
      ]
    }
  }
}
```

## Common OIDs

| OID | Description |
|-----|-------------|
| 1.3.6.1.2.1.1.1.0 | System Description |
| 1.3.6.1.2.1.1.3.0 | System Uptime |
| 1.3.6.1.2.1.1.5.0 | System Name |
| 1.3.6.1.2.1.25.3.2.1.5.1 | CPU Load |
| 1.3.6.1.2.1.25.2.3.1.6 | Memory Size |

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Database Logging

The application logs all SNMP queries to MongoDB:

- **Success Logs:** `snmp_successes` collection
- **Failure Logs:** `snmp_failures` collection

Each log entry includes:
- IP address
- Community string
- Response time
- Query data
- Timestamp

## Requirements

- Node.js >= 18
- MongoDB (for logging)
- SNMP simulator or SNMP-enabled devices (for testing)
- For SNMP-CMD: `snmpget` utility installed on system

## Troubleshooting

### SNMP Query Timeouts
- Check network connectivity to target host
- Verify SNMP port (default: 161) is accessible
- Confirm community string/credentials are correct

### MongoDB Connection Errors
- Ensure MongoDB is running
- Verify MONGODB_URI environment variable
- Check database permissions

### Missing snmpget Command
```bash
# Ubuntu/Debian
sudo apt-get install snmp

# CentOS/RHEL
sudo yum install net-snmp-utils
```

## License

UNLICENSED

## Support

For issues and questions, refer to:
- [NestJS Documentation](https://docs.nestjs.com)
- [Net-SNMP Library](https://www.net-snmp.org/)
