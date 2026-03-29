#ifndef SENSORVL6180_H
#define SENSORVL6180_H

#include <Adafruit_VL6180X.h>
#include <Adafruit_Sensor.h>

#define VL6180_UPDATE_INTERVAL 50


class SensorVL6180
{
public:
  bool isAvailable = false;
  sensors_event_t vl6180_d;

  void setup()
  {
    LittleFS.begin();

    if (_vl6180.begin()) 
    { 
      
      //SerialDebug.println("VL6180x Found!");

      // configure to keep sampling so that we don't block when needing to read the value
      _vl6180.startRangeContinuous(VL6180_UPDATE_INTERVAL);
      isAvailable = true;
    }
    else
    {
      //SerialDebug.println("Failed to find VL6180x chip");
    }
  }

  void loop()
  {
    uint32_t msNow = millis();
    // update the TOF readings every 50ms (20Hz)
    if((msNow % 50) == 0)
    {
      updateVL6180Readings();
    }
  }

  bool updateVL6180Readings()
  {
    if(!isAvailable)
    {
      return false;
    }

    uint32_t msNow = millis();
    //float lux = _vl6180.readLux(VL6180X_ALS_GAIN_5);
    uint8_t range = _vl6180.readRangeResult(); // read without blocking/looping
    uint8_t status = _vl6180.readRangeStatus();

    if(status == VL6180X_ERROR_NONE)
    {
      vl6180_d.distance = range / 10.0f;
    }
    else
    {
      vl6180_d.distance = NAN;
    }

    return true;
  }

private:
  Adafruit_VL6180X _vl6180 = Adafruit_VL6180X();
};

#endif //SENSORVL6180_H