# Ruuvi collector

Collects ruuvi tag data and exports it to a remote server

# Architech

```mermaid
flowchart TD
  SEND-->API
  subgraph Ruuvi Collector
    start-->CBE[Collect BLE events]
    CBE-->PARSE[Parse BLE events]
    PARSE-->|Write buffer|BUFFER
    PARSE-->|Loop back|CBE
    SCHEDULE[Scheduler]-->|Read buffer|BUFFER
    SCHEDULE-->|Activates 5 min interval|SCHEDULE
    BUFFER-->|Return buffer data|SCHEDULE
    SCHEDULE-->SEND[Send event]
    SEND
  end
  subgraph Endpoint
    API
  end
```

# TODO

- ✅ architech drawing
- 🚫 buffer events
- 🚫 listen ble advertisement messages
- 🚫 parse ble advertisement 
- 🚫 send data to cloud endpoint
- 🚫 should use zod and tRPC?
- 🚫 typescript type tests?
