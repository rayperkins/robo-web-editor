#ifndef OTTO_SENSORS_H
#define OTTO_SENSORS_H

#include <Wire.h>
#include <ADCInput.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#include "otto_config.h"
//#include "src/MPU6050/MPU6050_6Axis_MotionApps612.h"
#define DISTANCE_UPDATE_INTERVAL 50
#define MPU6050_UPDATE_INTERVAL 500
#define MPU6050_CALIBRATION_SAMPLE_COUNT 500
#define MPU6050_PWR 3
#define ULTRASOUND_TRIG 9
#define ULTRASOUND_ECHO 8
#define MICROPHONE_PWR 22
#define MICROPHONE_SAMPLERATE 2000

extern void PrintDebug(const char* input...);

typedef struct {
  float ax; 
  float ay; 
  float az; 
  float gx; 
  float gy; 
  float gz;
} sensor_calibrations_t;


class OttoSensors
{
public:
  bool mpu6050IsAvailable = false;
  sensors_event_t mpu6050_a, mpu6050_g, mpu6050_temp;
  long distance;

  void setup() {
    // setup sensors
    pinMode(MPU6050_PWR, OUTPUT); 
    pinMode(ULTRASOUND_TRIG, OUTPUT); 
    pinMode(ULTRASOUND_ECHO, INPUT);

    // setup microphone
    pinMode(MICROPHONE_PWR, OUTPUT); 
    digitalWrite(MICROPHONE_PWR, HIGH);
    _microphone.begin(MICROPHONE_SAMPLERATE);
      
    // setup mpu6050
    digitalWrite(MPU6050_PWR, HIGH);
    Wire.setSDA(4);
    Wire.setSCL(5);
    Wire.begin();

    if (_mpu6050.begin()) 
    { 
      //SerialDebug.println("MPU6050 Found!");
      PrintDebug("MPU6050 Found!");
      _mpu6050.setAccelerometerRange(MPU6050_RANGE_8_G);
      _mpu6050.setGyroRange(MPU6050_RANGE_500_DEG);
      _mpu6050.setFilterBandwidth(MPU6050_BAND_21_HZ);
      // get expected DMP packet size for later comparison
      //uint16_t packetSize = mpu.dmpGetFIFOPacketSize();
      mpu6050IsAvailable = true;
    }
    else
    {
      PrintDebug("Failed to find MPU6050 chip");
    }

    PrintDebug("Sensor setup()");
  }

  void loop()
  {
    uint32_t msNow = millis();
    // update the MPU readings every 5ms (200Hz)
    if((msNow % MPU6050_UPDATE_INTERVAL) == 0)
    {
      if(updateMP6050Readings() 
        && _isCalibrating
        && _mpu6050CalibrationCount < MPU6050_CALIBRATION_SAMPLE_COUNT)
      {
        _mpu6050CalibrationCount += 1;
        _calibrationValues.ax += mpu6050_a.acceleration.x;
        _calibrationValues.ay += mpu6050_a.acceleration.y;
        _calibrationValues.az += mpu6050_a.acceleration.z;
        _calibrationValues.gx += mpu6050_g.gyro.x;
        _calibrationValues.gy += mpu6050_g.gyro.y;
        _calibrationValues.gz += mpu6050_g.gyro.z;
      }
    }

    // update distance every 50ms (20Hz)
    if((msNow % DISTANCE_UPDATE_INTERVAL) == 0)
    {
      update_distance();
      //PrintDebug("distance=%d", distance);
    }

    process_microphone();
    
    if(_isCalibrating 
      && _mpu6050CalibrationCount >= MPU6050_CALIBRATION_SAMPLE_COUNT)
    {
      endCalibration();
    }
  }

  bool updateMP6050Readings()
  {
    if(!mpu6050IsAvailable)
    {
      return false;
    }

    bool isValid = _mpu6050.getEvent(&mpu6050_a, &mpu6050_g, &mpu6050_temp);
    if(isValid && _isCalibrated)
    {
      mpu6050_a.acceleration.x -= _calibrationValues.ax;
      mpu6050_a.acceleration.y -= _calibrationValues.ay;
      mpu6050_a.acceleration.z -= _calibrationValues.az;
      mpu6050_g.gyro.x -= _calibrationValues.gx;
      mpu6050_g.gyro.y -= _calibrationValues.gy;
      mpu6050_g.gyro.z -= _calibrationValues.gz;
      
    }

    //PrintDebug("ax=%f ay=%f az= %f", mpu6050_a.acceleration.x , mpu6050_a.acceleration.y, mpu6050_a.acceleration.z);

    return isValid;
  }

  bool update_distance() {
   long duration, newDistance;

   digitalWrite(ULTRASOUND_TRIG, LOW);
   delayMicroseconds(2);
   digitalWrite(ULTRASOUND_TRIG, HIGH);
   delayMicroseconds(10);
   digitalWrite(ULTRASOUND_TRIG, LOW);
   duration = pulseIn(ULTRASOUND_ECHO, HIGH);

   newDistance = duration / 58;
   distance = (distance >> 2) + (newDistance >> 2);  // basic filtering

   return newDistance > 0;
  }

  bool process_microphone() {
    int readCount = 0;
    while(_microphone.available()) {
      //Serial.print(_microphone.read(), HEX);
      readCount++;
    }

    if(readCount > 0) {
      //Serial.println();
    }

    return readCount > 0;
  }

  void startCalibration()
  {
    beginCalibration();
  }

private:
  Adafruit_MPU6050 _mpu6050;
  ADCInput _microphone = ADCInput(A2);
  bool _isCalibrating = false, _isCalibrated = false;
  int _mpu6050CalibrationCount = 0;
  sensor_calibrations_t _calibrationValues;

  void initCalibration()
  {
    _isCalibrated = false;
    _isCalibrating = false;
    _calibrationValues.ax = 0;
    _calibrationValues.ay = 0;
    _calibrationValues.az = 0;
    _calibrationValues.gx = 0;
    _calibrationValues.gy = 0;
    _calibrationValues.gz = 0;

    if(OttoConfig.isValid) {
      _calibrationValues.ax = OttoConfig.current.ax;
      _calibrationValues.ay = OttoConfig.current.ay;
      _calibrationValues.az = OttoConfig.current.az;
      _calibrationValues.gx = OttoConfig.current.gx;
      _calibrationValues.gy = OttoConfig.current.gy;
      _calibrationValues.gz = OttoConfig.current.gz;
      _isCalibrated = true;
    }
  }

  void beginCalibration()
  {
    initCalibration();
    _mpu6050CalibrationCount = 0;
    _isCalibrated = false;
    _isCalibrating = true;
  }

  void endCalibration()
  {
      _calibrationValues.ax /= _mpu6050CalibrationCount;
      _calibrationValues.ay /= _mpu6050CalibrationCount;
      _calibrationValues.az /= _mpu6050CalibrationCount;
      _calibrationValues.gx /= _mpu6050CalibrationCount;
      _calibrationValues.gy /= _mpu6050CalibrationCount;
      _calibrationValues.gz /= _mpu6050CalibrationCount;

      OttoConfig.current.ax = _calibrationValues.ax;
      OttoConfig.current.ay = _calibrationValues.ay;
      OttoConfig.current.az = _calibrationValues.az;
      OttoConfig.current.gx = _calibrationValues.gx;
      OttoConfig.current.gy = _calibrationValues.gy;
      OttoConfig.current.gz = _calibrationValues.gz;
      OttoConfig.Save();

      _isCalibrating = false;
      _isCalibrated = true;

      PrintDebug("Calibration:");
      PrintDebug("  ax=%d ay=%d az= %d", _calibrationValues.ax, _calibrationValues.ay, _calibrationValues.az);
      PrintDebug("  gx=%d gy=%d gz= %d", _calibrationValues.gx, _calibrationValues.gy, _calibrationValues.gz);
  }

};

#endif // OTTO_SENSORS_H