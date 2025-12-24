# SNMP-CMD Module

Command-line based SNMP query module for NestJS. This module uses the system's `snmpget` utility to query SNMP agents, providing a lightweight alternative to the native SNMP library integration.

## Overview

The SNMP-CMD module provides REST API endpoints to execute SNMP queries via the command-line interface. It's particularly useful for:

- Minimal dependencies (relies on system snmp tools)
- Simplified SNMP querying
- Integration with existing SNMP command-line workflows
- Distributed query execution
- Automatic logging to MongoDB

## Features

- **SNMPv2c Support:** Query SNMP agents using version 2c protocol
- **Batch Queries:** Query multiple OIDs in a single request
- **Response Metrics:** Track response times and reachability status
- **Automatic Logging:** All requests logged to MongoDB
- **Error Handling:** Detailed error messages for failed queries
- **API Documentation:** Built-in Swagger documentation

## Installation

### Prerequisites

Ensure SNMP tools are installed on your system:

```bash
# Ubuntu/Debian
sudo apt-get install snmp

# CentOS/RHEL
sudo yum install net-snmp-utils

# macOS
brew install net-snmp
```

### Module Setup

The module is automatically included in the main application. No additional installation steps required.

## Configuration

No specific configuration needed. The module uses the default `snmpget` command available on the system.

## API Endpoints

### GET SNMP Values

**Endpoint:** `POST /snmp-cmd/get`

**Description:** Query SNMP values from a single host using the command-line snmpget utility.

#### Request Body

```typescript
{
  ip: string;           // IP address of the SNMP agent
  community: string;    // SNMP community string (read-only)
  oids: string[];       // Array of OIDs to query
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/snmp-cmd/get \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.1",
    "community": "public",
    "oids": [
      "1.3.6.1.2.1.1.1.0",
      "1.3.6.1.2.1.1.3.0",
      "1.3.6.1.2.1.1.5.0"
    ]
  }'
```

#### Example Response

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
          "value": "Linux router 5.15.0-1234"
        },
        {
          "oid": "1.3.6.1.2.1.1.3.0",
          "value": "1233456789"
        },
        {
          "oid": "1.3.6.1.2.1.1.5.0",
          "value": "router.example.com"
        }
      ]
    }
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `community` | string | SNMP community string used |
| `data.reachable` | boolean | Whether the host responded to SNMP queries |
| `data.responseTimeMs` | number | Total response time in milliseconds |
| `data.data` | array | Array of OID-value pairs or error information |
| `data.data[].oid` | string | Object Identifier |
| `data.data[].value` | string | Retrieved value (if successful) |
| `data.data[].error` | string | Error message (if failed) |

## Usage Examples

### Query System Information

```javascript
const response = await fetch('http://localhost:3000/snmp-cmd/get', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: '192.168.1.1',
    community: 'public',
    oids: [
      '1.3.6.1.2.1.1.1.0',  // System Description
      '1.3.6.1.2.1.1.5.0',  // System Name
      '1.3.6.1.2.1.1.3.0'   // System Uptime
    ]
  })
});

const data = await response.json();
console.log(data);
```

### Query Network Interfaces

```javascript
const response = await fetch('http://localhost:3000/snmp-cmd/get', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: '192.168.1.1',
    community: 'public',
    oids: [
      '1.3.6.1.2.1.2.2.1.2.1',  // Interface Description
      '1.3.6.1.2.1.2.2.1.10.1', // Bytes In
      '1.3.6.1.2.1.2.2.1.16.1'  // Bytes Out
    ]
  })
});

const data = await response.json();
console.log(data);
```

### Query CPU and Memory

```javascript
const response = await fetch('http://localhost:3000/snmp-cmd/get', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ip: '192.168.1.1',
    community: 'public',
    oids: [
      '1.3.6.1.2.1.25.3.2.1.5.1',  // CPU Load
      '1.3.6.1.2.1.25.2.2.0',       // Total Memory
      '1.3.6.1.2.1.25.2.3.1.6.1'    // Memory Used
    ]
  })
});

const data = await response.json();
console.log(data);
```

## Common OIDs Reference

### System Information

| OID | Description |
|-----|-------------|
| 1.3.6.1.2.1.1.1.0 | System Description |
| 1.3.6.1.2.1.1.3.0 | System Uptime (hundredths of seconds) |
| 1.3.6.1.2.1.1.4.0 | System Contact |
| 1.3.6.1.2.1.1.5.0 | System Name |
| 1.3.6.1.2.1.1.6.0 | System Location |

### Network Interfaces

| OID | Description |
|-----|-------------|
| 1.3.6.1.2.1.2.1.0 | Number of Interfaces |
| 1.3.6.1.2.1.2.2.1.2.X | Interface Description |
| 1.3.6.1.2.1.2.2.1.10.X | Bytes In |
| 1.3.6.1.2.1.2.2.1.16.X | Bytes Out |

### CPU & Memory (UCD-SNMP)

| OID | Description |
|-----|-------------|
| 1.3.6.1.2.1.25.3.2.1.5.1 | CPU Load 1 min |
| 1.3.6.1.2.1.25.3.2.1.5.2 | CPU Load 5 min |
| 1.3.6.1.2.1.25.3.2.1.5.3 | CPU Load 15 min |
| 1.3.6.1.4.1.2021.4.3.0 | Total Memory |
| 1.3.6.1.4.1.2021.4.4.0 | Available Memory |

## Database Schema

Success logs are stored with the following schema:

```typescript
{
  ip: string;
  communityString: string;
  status: 'success';
  responseTimeMs: number;
  data: Array<{
    oid: string;
    value?: string;
    error?: string;
  }>;
  createdAt: Date;
}
```

Failure logs:

```typescript
{
  ip: string;
  communityString: string;
  status: 'fail';
  responseTimeMs: number;
  remark: string;          // Error summary
  error: Array<{           // Detailed error data
    oid: string;
    error: string;
  }>;
  createdAt: Date;
}
```

## Error Handling

The module handles various error scenarios:

### Host Unreachable
```json
{
  "ip:community": {
    "community": "community",
    "data": {
      "reachable": false,
      "responseTimeMs": 5000,
      "data": [
        {
          "oid": "1.3.6.1.2.1.1.1.0",
          "error": "Timeout: No response from host"
        }
      ]
    }
  }
}
```

### Invalid OID
```json
{
  "oid": "1.3.6.1.2.1.999.0",
  "error": "Unknown Object Identifier"
}
```

## Performance Considerations

- **Timeout:** Default snmpget timeout is 5 seconds per OID
- **Batch Queries:** Each OID is queried sequentially
- **Network Latency:** Response times include full round-trip time
- **Concurrent Requests:** Multiple simultaneous API requests are supported

## Troubleshooting

### Command Not Found Error

**Error:** `snmpget: command not found`

**Solution:** Install SNMP tools
```bash
# Ubuntu/Debian
sudo apt-get install snmp

# CentOS/RHEL
sudo yum install net-snmp-utils
```

### Authentication Failed

**Error:** `Authentication failure (incorrect community name?)`

**Solution:** Verify the community string:
```bash
snmpget -v2c -c public 192.168.1.1 1.3.6.1.2.1.1.1.0
```

### Timeout Issues

**Error:** `No response from host`

**Possible causes:**
- Host is down or unreachable
- SNMP port (161) is blocked by firewall
- SNMP service not running on target
- Network connectivity issue

**Solution:**
```bash
# Test connectivity
ping 192.168.1.1

# Test SNMP port
telnet 192.168.1.1 161

# Test SNMP query manually
snmpget -v2c -c public -t 10 192.168.1.1 1.3.6.1.2.1.1.1.0
```

## File Structure

```
snmp-cmd/
├── snmp-cmd.module.ts          # Module configuration
├── snmp-cmd.controller.ts       # REST API controller
├── snmp-cmd.service.ts          # SNMP query logic
├── snmp-cmd.service.spec.ts    # Unit tests
├── snmp-cmd.controller.spec.ts # Controller tests
├── dto/
│   └── snmp.request.dto.ts      # Request validation DTO
├── schema/
│   └── snmp-cmd.log.schema.ts   # MongoDB schemas
└── README.md                    # This file
```

## Testing

### Unit Tests

```bash
npm run test -- snmp-cmd
```

### Manual Testing

```bash
# Start the application
npm run start:dev

# Test the endpoint
curl -X POST http://localhost:3000/snmp-cmd/get \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "127.0.0.1",
    "community": "public",
    "oids": ["1.3.6.1.2.1.1.1.0"]
  }'
```

## Related Modules

- [SNMP Module](../snmp/README.md) - Native SNMP library integration
- [Main Application](../../README.md) - Application overview

## License

UNLICENSED

## References

- [SNMP Protocol](https://tools.ietf.org/html/rfc3416)
- [Net-SNMP Documentation](https://www.net-snmp.org/)
- [SNMP OID Reference](http://oid-info.com/)
