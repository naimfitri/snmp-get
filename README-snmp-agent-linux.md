# Creating an SNMP Agent on Linux

This guide demonstrates how to set up a Net-SNMP agent with support for multiple SNMPv2c communities and SNMPv3 users.

## 1. Install Net-SNMP

### Arch Linux

```bash
sudo pacman -S net-snmp
```

### Debian / Ubuntu

```bash
sudo apt update
sudo apt install snmp snmpd
```

### Verify Installation

```bash
snmpd -v
# Expected output: NET-SNMP version: 5.9.x
```

## 2. Prepare Configuration Directories

Net-SNMP may not create its persistent storage directories automatically. Ensure they exist and have the correct permissions:

```bash
sudo mkdir -p /etc/snmp
sudo mkdir -p /var/lib/net-snmp
sudo chmod 755 /etc/snmp /var/lib/net-snmp
```

## 3. Configure the Main Agent

Create the primary configuration file:

```bash
sudo nano /etc/snmp/snmpd.conf
```

### Minimal Working Config

```bash
###############################################################################
# Load default Net-SNMP configuration (includes SNMPv3 users)
###############################################################################
includeFile /usr/share/snmp/snmpd.conf

###############################################################################
# SNMPv2c communities
###############################################################################
rocommunity public1
rocommunity public2
rocommunity public3
rocommunity public4
rocommunity public5
```

> **Note for Arch Linux**: The systemd unit handles the listening address. Do not define agentAddress in this file unless you are overriding the service defaults.

## 4. Create SNMPv3 Users

Use the net-snmp-create-v3-user helper script. This generates hashed keys and saves them in `/var/lib/net-snmp/snmpd.conf`.

### Batch User Generation

```bash
sudo net-snmp-create-v3-user -ro -A authpass1 -a MD5 -X privpass1 -x AES userv3_1
sudo net-snmp-create-v3-user -ro -A authpass2 -a MD5 -X privpass2 -x AES userv3_2
sudo net-snmp-create-v3-user -ro -A authpass3 -a MD5 -X privpass3 -x AES userv3_3
sudo net-snmp-create-v3-user -ro -A authpass4 -a MD5 -X privpass4 -x AES userv3_4
sudo net-snmp-create-v3-user -ro -A authpass5 -a MD5 -X privpass5 -x AES userv3_5
```

## 5. Start the SNMP Daemon

### Test in Foreground

Check for errors before committing to the background service:

```bash
sudo snmpd -f -Lo
```

Expected output: `Listening on UDP: 0.0.0.0:161`. Stop with `Ctrl+C`.

### Start via Systemd

```bash
sudo systemctl enable snmpd
sudo systemctl start snmpd
systemctl status snmpd
```

## 6. Testing Connectivity

### SNMPv2c Test

```bash
snmpget -v2c -c public1 localhost 1.3.6.1.2.1.1.5.0
# Expected output: SNMPv2-MIB::sysName.0 = STRING: <hostname>
```

### SNMPv3 Test

```bash
snmpget -v3 -l authPriv \
  -u userv3_1 \
  -a MD5 -A authpass1 \
  -x AES -X privpass1 \
  localhost 1.3.6.1.2.1.1.1.0
# Expected output: SNMPv2-MIB::sysDescr.0 = STRING: Linux <hostname> ...
```

## Best Practices & Notes

| Category | Recommendation |
|----------|---|
| File Editing | Do not manually edit `/var/lib/net-snmp/snmpd.conf`. It contains hashed credentials. |
| v2c Security | Restrict access to known IP ranges: `rocommunity public1 192.168.1.0/24` |
| v3 Security | Use stronger authentication and privacy protocols in production (e.g., SHA and AES-256). |
| Systemd | Use `systemctl edit snmpd.service` to change listening addresses instead of modifying snmpd.conf. |

**Setup Complete.** Your agent is now ready for monitoring integration.