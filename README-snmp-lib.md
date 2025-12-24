# SNMP Module

Native SNMP protocol integration module using the net-snmp library. This module provides direct support for both SNMPv2c and SNMPv3 protocols with full authentication and privacy options.

## Overview

The SNMP module uses the `net-snmp` Node.js library to directly communicate with SNMP agents, providing:

- **SNMPv2c Support:** Community string-based authentication
- **SNMPv3 Support:** User-based security with optional authentication and encryption
- **Batch Queries:** Query multiple hosts simultaneously
- **Response Metrics:** Track response times and reachability
- **MongoDB Logging:** Comprehensive success and failure logging
- **Swagger Documentation:** Interactive API documentation

## Features

- Full SNMPv2c protocol support
- SNMPv3 with multiple authentication protocols (MD5, SHA, SHA256, SHA384, SHA512)
- SNMPv3 with multiple encryption protocols (DES, AES)
- Parallel host querying
- Performance metrics (response time)
- Automatic success/failure logging to MongoDB
- Input validation with class-validator
- Comprehensive error handling

## Installation

The module is automatically included in the main application. Dependencies are managed by npm.

### Required Dependencies

```json
{
  "net-snmp": "^3.26.0",
  "class-validator": "^0.14.3",
  "class-transformer": "^0.5.1"
}
```

## Configuration

### Module Registration

The SNMP module is registered in the main `app.module.ts`. No additional configuration needed.

### Database Connection

MongoDB connection must be configured for logging to work properly.

## API Endpoints

### SNMPv2c GET Request

**Endpoint:** `POST /snmp/getSnmpV2`

**Description:** Query multiple SNMP agents simultaneously using SNMPv2c protocol.

#### Request Body Schema

```typescript
{
  hosts: Array<{
    host: string;      // IP address or hostname
    community: string; // SNMP community string
    port?: number;     // SNMP port (optional, default: 1161)
  }>;
  oids: string[];      // Array of Object Identifiers to query
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/snmp/getSnmpV2 \
  -H "Content-Type: application/json" \
  -d '{
    "hosts": [
      {
        "host": "192.168.1.1",
        "community": "public",
        "port": 161
      },
      {
        "host": "192.168.1.2",
        "community": "private",
        "port": 161
      }
    ],
    "oids": [
      "1.3.6.1.2.1.1.1.0",
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
      "responseTimeMs": 15,
      "data": [
        {
          "oid": "1.3.6.1.2.1.1.1.0",
          "value": "Linux router 5.15.0"
        },
        {
          "oid": "1.3.6.1.2.1.1.5.0",
          "value": "router.example.com"
        }
      ]
    }
  },
  "192.168.1.2:private": {
    "community": "private",
    "error": "Request timed out"
  }
}
```

#### Response Structure

| Field | Type | Description |
|-------|------|-------------|
| `[key]` | object | Result keyed by `{host}:{community}` |
| `.community` | string | SNMP community string used |
| `.data` | object | Query result (if successful) |
| `.data.reachable` | boolean | Whether host responded |
| `.data.responseTimeMs` | number | Query duration in milliseconds |
| `.data.data` | array | Array of OID-value pairs |
| `.error` | string | Error message (if failed) |

---

### SNMPv3 GET Request

**Endpoint:** `POST /snmp/getSnmpV3`

**Description:** Query SNMP agents using SNMPv3 protocol with optional authentication and encryption.

#### Request Body Schema

```typescript
{
  host: string;              // IP address or hostname
  port: number;              // SNMP port (default: 161)
  username: string;          // SNMPv3 username
  securityLevel: string;     // 'authNoPriv' or 'authPriv'
  authProtocol: string;      // MD5, SHA, SHA256, SHA384, SHA512
  authPassword: string;      // Authentication password
  privProtocol: string;      // DES or AES (required if authPriv)
  privPassword: string;      // Privacy/encryption password (required if authPriv)
  community?: string;        // Context name (optional)
  oids: string[];            // Array of OIDs to query
}
```

#### Authentication Protocols

- **MD5** - Message Digest Algorithm (Legacy)
- **SHA** - Secure Hash Algorithm 1
- **SHA256** - Secure Hash Algorithm 2 (256-bit)
- **SHA384** - Secure Hash Algorithm 2 (384-bit)
- **SHA512** - Secure Hash Algorithm 2 (512-bit)

#### Privacy Protocols

- **DES** - Data Encryption Standard (Legacy)
- **AES** - Advanced Encryption Standard (Recommended)

#### Example Request (authPriv)

```bash
curl -X POST http://localhost:3000/snmp/getSnmpV3 \
  -H "Content-Type: application/json" \
  -d '{
    "host": "192.168.1.1",
    "port": 161,
    "username": "admin",
    "securityLevel": "authPriv",
    "authProtocol": "SHA256",
    "authPassword": "myAuthPassword123",
    "privProtocol": "AES",
    "privPassword": "myPrivPassword456",
    "oids": [
      "1.3.6.1.2.1.1.1.0",
      "1.3.6.1.2.1.1.5.0"
    ]
  }'
```

#### Example Request (authNoPriv)

```bash
curl -X POST http://localhost:3000/snmp/getSnmpV3 \
  -H "Content-Type: application/json" \
  -d '{
    "host": "192.168.1.1",
    "port": 161,
    "username": "monitor",
    "securityLevel": "authNoPriv",
    "authProtocol": "SHA",
    "authPassword": "monitorPass123",
    "oids": ["1.3.6.1.2.1.1.1.0"]
  }'
```

#### Example Response

```json
[
  {
    "oid": "1.3.6.1.2.1.1.1.0",
    "value": "Linux workstation 5.15.0"
  },
  {
    "oid": "1.3.6.1.2.1.1.5.0",
    "value": "workstation.example.com"
  }
]
```

## Usage Examples

### Query Multiple Hosts (SNMPv2c)

```javascript
const hosts = [
  { host: '192.168.1.1', community: 'public' },
  { host: '192.168.1.2', community: 'public' },
  { host: '192.168.1.3', community: 'internal' }
];

const oids = [
  '1.3.6.1.2.1.1.1.0',  // System Description
  '1.3.6.1.2.1.1.3.0'   // System Uptime
];

const response = await fetch('http://localhost:3000/snmp/getSnmpV2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ hosts, oids })
});

const results = await response.json();
```

### Query with SNMPv3 (Secure)

```javascript
const request = {
  host: '192.168.1.100',
  port: 161,
  username: 'secureuser',
  securityLevel: 'authPriv',
  authProtocol: 'SHA256',
  authPassword: 'secureAuthPass',
  privProtocol: 'AES',
  privPassword: 'securePrivPass',
  oids: [
    '1.3.6.1.2.1.1.1.0',
    '1.3.6.1.2.1.25.3.2.1.5.1'  // CPU Load
  ]
};

const response = await fetch('http://localhost:3000/snmp/getSnmpV3', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});

const result = await response.json();
```

### Handle Mixed Results

```javascript
const response = await fetch('http://localhost:3000/snmp/getSnmpV2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hosts: [
      { host: '192.168.1.1', community: 'public' },
      { host: '192.168.1.99', community: 'public' }
    ],
    oids: ['1.3.6.1.2.1.1.1.0']
  })
});

const results = await response.json();

Object.entries(results).forEach(([key, result]) => {
  if (result.error) {
    console.error(`${key}: Failed - ${result.error}`);
  } else {
    console.log(`${key}: Success in ${result.data.responseTimeMs}ms`);
    console.log('Values:', result.data.data);
  }
});
```

## Common OID Reference

### System Information

| OID | Description | Example |
|-----|-------------|---------|
| 1.3.6.1.2.1.1.1.0 | System Description | Linux router 5.15.0 |
| 1.3.6.1.2.1.1.3.0 | System Uptime (cs) | 1234567890 |
| 1.3.6.1.2.1.1.4.0 | System Contact | admin@example.com |
| 1.3.6.1.2.1.1.5.0 | System Name | myrouter |
| 1.3.6.1.2.1.1.6.0 | System Location | Data Center A |

### Network Interfaces

| OID | Description |
|-----|-------------|
| 1.3.6.1.2.1.2.1.0 | Number of network interfaces |
| 1.3.6.1.2.1.2.2.1.2.X | Interface description (eth0, etc) |
| 1.3.6.1.2.1.2.2.1.10.X | Octets received |
| 1.3.6.1.2.1.2.2.1.16.X | Octets transmitted |
| 1.3.6.1.2.1.2.2.1.20.X | Outgoing packets discarded |

### TCP/IP Statistics

| OID | Description |
|-----|-------------|
| 1.3.6.1.2.1.6.9.0 | TCP connection count |
| 1.3.6.1.2.1.6.10.0 | TCP input errors |
| 1.3.6.1.2.1.7.3.0 | UDP input errors |

## Database Logging

All SNMP queries are automatically logged to MongoDB collections.

### Success Schema

```typescript
{
  ip: string;
  communityString: string;
  status: 'success';
  responseTimeMs: number;
  data: Array<{
    oid: string;
    value: string;
  }>;
  createdAt: Date;
}
```

### Failure Schema

```typescript
{
  ip: string;
  communityString: string;
  status: 'fail';
  responseTimeMs: number;
  remark: string;
  error: any;
  createdAt: Date;
}
```

## Configuration Reference

### Session Options

```javascript
{
  port: 161,              // SNMP port
  retries: 1,             // Number of retries
  timeout: 5000,          // Timeout in milliseconds
  transport: 'udp4',      // Transport protocol
  trapPort: 162,          // Trap port
  version: snmp.Version2c // SNMP version
}
```

## Performance Tips

1. **Batch Queries:** Group related OIDs in a single request
2. **Timeout Settings:** Increase timeout for high-latency networks
3. **Parallel Requests:** Query multiple hosts concurrently
4. **Host Count:** Balance between parallel efficiency and resource usage
5. **OID Count:** Keep per-request OID count reasonable (< 50)

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Timeout` | No response from host | Verify connectivity, increase timeout |
| `Authentication failure` | Wrong community string | Check SNMP configuration |
| `Unknown Object Identifier` | Invalid OID | Verify OID is supported by device |
| `No such instance` | OID doesn't exist on device | Check device capabilities |
| `Connection refused` | SNMP not running | Enable SNMP on target device |

## Testing with Docker

The project includes Docker Compose configuration for testing:

```bash
# Start SNMP simulators
docker-compose up

# Run queries against simulators
curl -X POST http://localhost:3000/snmp/getSnmpV2 \
  -H "Content-Type: application/json" \
  -d '{
    "hosts": [{"host": "localhost", "community": "pendekarkambing", "port": 161}],
    "oids": ["1.3.6.1.2.1.1.1.0"]
  }'
```

## File Structure

```
snmp/
├── snmp.module.ts          # Module configuration
├── snmp.controller.ts       # REST API endpoints
├── snmp.service.ts          # SNMP protocol logic
├── dto/
│   ├── snmp.get.dto.ts      # SNMPv2c request DTO
│   └── snmpV3.get.dto.ts    # SNMPv3 request DTO
├── schema/
│   └── snmp.log.schema.ts   # MongoDB logging schemas
└── README.md                # This file
```

## Related Modules

- [SNMP-CMD Module](../snmp-cmd/README.md) - Command-line SNMP integration
- [Main Application](../../README.md) - Application overview

## License

UNLICENSED

## References

- [SNMP RFC 3416](https://tools.ietf.org/html/rfc3416)
- [SNMPv3 RFC 3414](https://tools.ietf.org/html/rfc3414)
- [Net-SNMP Project](https://www.net-snmp.org/)
- [SNMP OID Database](http://oid-info.com/)
