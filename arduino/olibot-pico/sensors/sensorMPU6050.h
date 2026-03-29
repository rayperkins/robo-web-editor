#ifndef SENSORMPU6050_H
#define SENSORMPU6050_H

//#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <LittleFS.h>
//#include <MPU6050_6Axis_MotionApps612.h>
#include "MPU6050_6Axis_MotionApps20.h"
//#include "../libs/MPU6050/MPU6050_6Axis_MotionApps612.h"

#define MPU6050_UPDATE_INTERVAL 5
#define MPU6050_CALIBRATION_SAMPLE_COUNT 500

#define MPU6050_PIN_PWR 2
#define MPU6050_PIN_INT 3

typedef struct {
  float ax; 
  float ay; 
  float az; 
  float gx; 
  float gy; 
  float gz;
} sensorMPU6050_values_t;


class SensorMPU6050
{
public:
  bool mpu6050IsAvailable = false;
  bool isCalibrated = false;
  bool isCalibrating = false;
  sensorMPU6050_values_t currentValues;
  float currentHeading;
  sensors_event_t mpu6050_a, mpu6050_g, mpu6050_temp;

  void setup()
  {
    pinMode (MPU6050_PIN_PWR, OUTPUT) ;
    digitalWrite (MPU6050_PIN_PWR, HIGH);

    LittleFS.begin();
    Wire.begin();
    Wire.setClock(400000); // 400kHz I2C clock. Comment on this line if having compilation difficulties

    // mpu6050 start up
    mpu.initialize(ACCEL_FS::A2G, GYRO_FS::G250DPS);
    uint8_t devStatus = mpu.dmpInitialize();
    // make sure it worked (returns 0 if so)
    if (devStatus == 0)
    {
      mpu.setXGyroOffset(0);
      mpu.setYGyroOffset(0);
      mpu.setZGyroOffset(0);
      mpu.setXAccelOffset(0);
      mpu.setYAccelOffset(0);
      mpu.setZAccelOffset(0);
      //mpu.CalibrateAccel(6);
      //mpu.CalibrateGyro(6);
      mpu.setDMPEnabled(true);
      int mpuIntStatus = mpu.getIntStatus();

      _dmpPacketSize = mpu.dmpGetFIFOPacketSize();
      mpu6050IsAvailable = true;
    }

    // load calibration
    initCalibration();
  }

  void loop()
  {
    uint32_t msNow = millis();
    // update the MPU readings every 5ms (200Hz)
    if((msNow % MPU6050_UPDATE_INTERVAL) == 0)
    {    
      if(isCalibrating
        && _mpu6050CalibrationCount == 0) {
        mpu.CalibrateAccel(6);  // Calibration Time: generate offsets and calibrate our MPU6050
        mpu.CalibrateGyro(6);
      }

      if(updateMP6050Readings() 
        && isCalibrating
        && _mpu6050CalibrationCount < MPU6050_CALIBRATION_SAMPLE_COUNT)
      {
        _mpu6050CalibrationCount += 1;
        _calibrationValues.ax += currentValues.ax;
        _calibrationValues.ay += currentValues.ay;
        _calibrationValues.az += currentValues.az;
        _calibrationValues.gx += currentValues.gx;
        _calibrationValues.gy += currentValues.gy;
        _calibrationValues.gz += currentValues.gz;
      }
    }

    if(isCalibrating 
      && _mpu6050CalibrationCount >= MPU6050_CALIBRATION_SAMPLE_COUNT)
    {
      endCalibration();
      currentHeading = 0;
    }
  }

  bool updateMP6050Readings() {
    if(!mpu6050IsAvailable) {
      return false;
    }

    // USE Raw values section
    // int16_t ax, ay, az;
    // int16_t gx, gy, gz;
    // mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
    // currentValues.ax = (ax / 16384.0) * 9.80665;
    // currentValues.az = (az / 16384.0) * 9.80665;
    // currentValues.ay = (ay / 16384.0) * 9.80665;
    // currentValues.gx = gx / 131.0;
    // currentValues.gy = gy / 131.0;
    // currentValues.gz = gz / 131.0;

    // USE DMP section
    if (mpu.dmpGetCurrentFIFOPacket(_fifoBuffer)) { // Get the Latest packet 
      Quaternion q;           // [w, x, y, z]         Quaternion container
      VectorInt16 aa;         // [x, y, z]            Accel sensor measurements
      VectorInt16 gy;         // [x, y, z]            Gyro sensor measurements
      VectorInt16 aaReal;     // [x, y, z]            Gravity-free accel sensor measurements
      VectorInt16 aaWorld;    // [x, y, z]            World-frame accel sensor measurements
      VectorFloat gravity;    // [x, y, z]            Gravity vector
      float euler[3];         // [psi, theta, phi]    Euler angle container
      float ypr[3];           // [yaw, pitch, roll]   Yaw/Pitch/Roll container and gravity vector

      mpu.dmpGetAccel(&aa, _fifoBuffer);
      mpu.dmpGetGyro(&gy, _fifoBuffer);

      mpu.dmpGetQuaternion(&q, _fifoBuffer);
      mpu.dmpGetGravity(&gravity, &q);
      mpu.dmpGetYawPitchRoll(ypr, &q, &gravity);
      mpu.dmpGetLinearAccel(&aaReal, &aa, &gravity);
      //mpu.dmpGetLinearAccelInWorld(&aaWorld, &aaReal, &q);
      // convert gyro
      mpu6050_g.gyro.x = (ypr[0] * 180/M_PI);
      mpu6050_g.gyro.y = (ypr[1] * 180/M_PI);
      mpu6050_g.gyro.z = (ypr[2] * 180/M_PI);
      // convert accel
      mpu6050_a.acceleration.x = aa.x;
      mpu6050_a.acceleration.y = aa.y;
      mpu6050_a.acceleration.z = aa.z;

      currentValues.ax = aaReal.x;
      currentValues.ay = aaReal.y;
      currentValues.az = aaReal.z;
      currentValues.gx = mpu6050_g.gyro.x;
      currentValues.gy = mpu6050_g.gyro.y;
      currentValues.gz = mpu6050_g.gyro.z;
    }

    // if(isCalibrated) {
    //   currentValues.ax -= _calibrationValues.ax;
    //   currentValues.ay -= _calibrationValues.ay;
    //   currentValues.az -= _calibrationValues.az;
    //   currentValues.gx -= _calibrationValues.gx;
    //   currentValues.gy -= _calibrationValues.gy;
    //   currentValues.gz -= _calibrationValues.gz;
    // }

    return true;
  }

  void startCalibration(HardwareSerial* serial)
  {
    _calibrationSerial = serial;
    startCalibration();
  }

private:
  MPU6050 mpu;
  HardwareSerial* _calibrationSerial = NULL;
  int _mpu6050CalibrationCount = 0;
  uint16_t _dmpPacketSize;    // Expected DMP packet size (default is 42 bytes)
  uint8_t _fifoBuffer[64]; // FIFO storage buffer
  sensorMPU6050_values_t _calibrationValues;

  void initCalibration()
  {
    isCalibrated = false;
    isCalibrating = false;
    _calibrationValues.ax = 0;
    _calibrationValues.ay = 0;
    _calibrationValues.az = 0;
    _calibrationValues.gx = 0;
    _calibrationValues.gy = 0;
    _calibrationValues.gz = 0;

    File f = LittleFS.open("sCali.bin", "r");
    if (f) {
      isCalibrated = f.read((uint8_t *)&_calibrationValues, sizeof(sensorMPU6050_values_t)) == sizeof(sensorMPU6050_values_t);
      f.close();
    }
  }

  void startCalibration()
  {
    if(!isCalibrating) {
      initCalibration();
      _mpu6050CalibrationCount = 0;
      isCalibrated = false;
      isCalibrating = true;
    }
  }

  void endCalibration()
  {
      _calibrationValues.ax /= _mpu6050CalibrationCount;
      _calibrationValues.ay /= _mpu6050CalibrationCount;
      _calibrationValues.az /= _mpu6050CalibrationCount;
      _calibrationValues.gx /= _mpu6050CalibrationCount;
      _calibrationValues.gy /= _mpu6050CalibrationCount;
      _calibrationValues.gz /= _mpu6050CalibrationCount;

      File f = LittleFS.open("sCali.bin", "w");
      if (f) {
        f.write((uint8_t *)&_calibrationValues, sizeof(sensorMPU6050_values_t));
        f.close();
      }

      isCalibrating = false;
      isCalibrated = true;

      if(_calibrationSerial != NULL)
      {
        _calibrationSerial->println();
        _calibrationSerial->print("Calibration: [");
        _calibrationSerial->print(_calibrationValues.ax); _calibrationSerial->print(", ");
        _calibrationSerial->print(_calibrationValues.ay); _calibrationSerial->print(", ");
        _calibrationSerial->print(_calibrationValues.az); _calibrationSerial->print(", ");
        _calibrationSerial->print(_calibrationValues.gx); _calibrationSerial->print(", ");
        _calibrationSerial->print(_calibrationValues.gy); _calibrationSerial->print(", ");
        _calibrationSerial->print(_calibrationValues.gz); _calibrationSerial->print(", ");
        _calibrationSerial->println("]");
        _calibrationSerial = NULL;
      }
  }
};

#endif //SENSORMPU6050_H