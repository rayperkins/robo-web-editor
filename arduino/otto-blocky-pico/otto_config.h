#ifndef OTTO_CONFIG_H
#define OTTO_CONFIG_H

#include <EEPROM.h>

#define OTTO_CONFIG_VERSION 1
#define OTTO_CONFIG_OFFSET 4

typedef struct {
  int8_t reserved0;
  int8_t reserved1; 
  int8_t reserved2;
  int8_t distanceThreshold; 
  int8_t trimLeftLeg; 
  int8_t trimRightLeg; 
  int8_t trimLeftFoot; 
  int8_t trimRightFoot; 
  float ax; 
  float ay; 
  float az; 
  float gx; 
  float gy; 
  float gz;
} otto_config_t;


class OttoConfig
{
public:
  otto_config_t current;
  bool isValid;

  void setup() 
  {
    EEPROM.begin(64); // needed for config
    Load();
  }

  void Save()
  {
    int8_t version = OTTO_CONFIG_VERSION;
    int8_t hash = 0;
    int8_t* data = (int8_t*)&current;

    for (int ptr = 0; ptr < sizeof(otto_config_t); ptr ++) {
      int8_t val = data[ptr];
      EEPROM.write(ptr + OTTO_CONFIG_OFFSET, val);
      hash += val;
    }

    EEPROM.write(0, version);
    EEPROM.write(1, hash);
    EEPROM.commit();
  }

private:
  void Load()
  {
    int8_t version = OTTO_CONFIG_VERSION;
    int8_t expectedHash = 0;
    int8_t actualHash = 0;
    int8_t* data = (int8_t*)&current;

    version = EEPROM.read(0);
    expectedHash = EEPROM.read(1);

    for (int ptr = 0; ptr < sizeof(otto_config_t); ptr ++) {
      int8_t val = EEPROM.read(ptr + OTTO_CONFIG_OFFSET);
      data[ptr] = val;
      actualHash += val;
    }

    isValid = version == OTTO_CONFIG_VERSION && expectedHash == actualHash;
  }

};

static OttoConfig OttoConfig;

#endif //OTTO_CONFIG_H