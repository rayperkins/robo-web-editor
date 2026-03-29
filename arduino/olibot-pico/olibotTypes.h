#ifndef OLIBOT_H
#define OLIBOT_H

typedef enum  {
    PROGRAM_RUNNING = 1,
} olibotStateFlag_t;


typedef struct olibotreaddata {
  uint8_t version;
  olibotStateFlag_t state;
  uint8_t reserved0;
  uint8_t reserved1;
  // calibration, 0 - 255
  int8_t trimLeftLeg;
  int8_t trimRightLeg;
  int8_t trimLeftFoot;
  int8_t trimRightFoot;
  // sensors
  uint16_t sensor_distance;
} olibotReadData_t;

#endif //OLIBOT_H