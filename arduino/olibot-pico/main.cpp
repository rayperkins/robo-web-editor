/*  
* Sketch to control the Olibot!
*/
#include <Arduino.h>
#include <Otto.h>
#include <EEPROM.h>
#include <BTstackLib.h>
#include <RPi_Pico_TimerInterrupt.h>
#include <RPi_Pico_ISR_Timer.h>
#include <RPi_Pico_ISR_Timer.hpp>

#include "config.h"
#include "diagnostics.h"
#include "BluetoothComms.h"
#include "olibot_code_interpreter.h"
#include "olibotMotion.h"
#include "sensors/sensorMPU6050.h"
#include "sensors/sensorVL6180.h"

#define ROBOT_CONTROL_INTERVAL_US 1000

bool robotControllerTimerHandler(struct repeating_timer *t);
void setTargets(float runTime, float speed, float heading);

float _timerIntervalSeconds = 0;
int _cmdEndTimeMs = 0;
long _lastSendTime = 0;
bool setupDone = false;
bool isCalibrated = false;

RPI_PICO_Timer ITimer0(0);

BluetoothComms bluetoothComms;
OlibotMotion motion;
SensorMPU6050 sensorMPU6050;
SensorVL6180 sensorVL6180;
// Otto Ottobot;
// OttoSensors sensors;
// OttoCodeInterpreter codeInterpreter;

// SENSORS IN CORE 1
void setup1() {
  sensorMPU6050.setup();
 // sensorVL6180.setup();
  motion.setup();
  //codeInterpreter.setup(&Ottobot, &sensors);
  ITimer0.attachInterruptInterval(ROBOT_CONTROL_INTERVAL_US, robotControllerTimerHandler);

  _timerIntervalSeconds = ROBOT_CONTROL_INTERVAL_US / 1000000.0;
}

void loop1() {

  if(!setupDone) {
    return;
  }

  if(!sensorMPU6050.isCalibrated 
    && !sensorMPU6050.isCalibrating) {

    DEBUGSERIAL.println("Calibrating...");
    sensorMPU6050.startCalibration(&DEBUGSERIAL);
  }

  //motion.setMotorValue(MotorA, 127);
  //motion.setMotorValue(MotorB, 127);
  sensorMPU6050.loop();
  //sensorVL6180.loop();
  //codeInterpreter.loop();

  // if(codeInterpreter.isEnabled() && !codeInterpreter.completed()) {

  // }
  // else if (command == "forward") {
  //   Forward();
  // }
  // else if (command == "backward") {
  //   Backward();
  // }
  // else if (command == "right") {
  //   Right();
  // }
  // else if (command == "left") {
  //   Left();
  // }
  // else if (command == "avoidance") {
  //   Avoidance();
  // }
  // else if (command == "force") {
  //   UseForce();
  // }
}

// MAIN APP IN CORE 0
void setup() {
  //rp2040.idleOtherCore();

  pinMode (LED_BUILTIN, OUTPUT) ;
  digitalWrite (LED_BUILTIN, LOW);

  DEBUGSERIAL.begin(115200);
  //bluetoothComms.setup();  

  //rp2040.resumeOtherCore();
  DEBUGSERIAL.println("Setup done!");
  setupDone = true;
}

void loop() {
  uint32_t msNow = millis();
  //bluetoothComms.onLoop();

  // flash LED
  if(msNow % 1000 < 500) 
  {
    digitalWrite(LED_BUILTIN,HIGH);
  }
  else
  {
    digitalWrite(LED_BUILTIN,LOW);
  }

  if((msNow - _lastSendTime) > 50 
    && sensorMPU6050.isCalibrated) {
    _lastSendTime = msNow;
    //&& motion.runIntervalSeconds > 0) {
    DEBUGSERIAL.print("MPU6050: [");
    DEBUGSERIAL.print(sensorMPU6050.currentValues.ax); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(sensorMPU6050.currentValues.ay); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(sensorMPU6050.currentValues.az); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(sensorMPU6050.currentValues.gx); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(sensorMPU6050.currentValues.gy); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(sensorMPU6050.currentValues.gz); DEBUGSERIAL.print("] ");
    DEBUGSERIAL.print("MOTION: [");
    DEBUGSERIAL.print(motion.currentHeading); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(motion.currentVelocity); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(motion.currentDistance); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(motion.currentLeftMotorSpeed); DEBUGSERIAL.print(", ");
    DEBUGSERIAL.print(motion.currentRightMotorSpeed); DEBUGSERIAL.print("] ");
    DEBUGSERIAL.println();

    // DEBUGSERIAL.print("MPU6050: [");
    // DEBUGSERIAL.print(sensorMPU6050.mpu6050_a.acceleration.x); DEBUGSERIAL.print(", ");
    // DEBUGSERIAL.print(sensorMPU6050.mpu6050_a.acceleration.y); DEBUGSERIAL.print(", ");
    // DEBUGSERIAL.print(sensorMPU6050.mpu6050_a.acceleration.z); DEBUGSERIAL.print(", ");
    // DEBUGSERIAL.print(sensorMPU6050.mpu6050_g.gyro.x); DEBUGSERIAL.print(", ");
    // DEBUGSERIAL.print(sensorMPU6050.mpu6050_g.gyro.y); DEBUGSERIAL.print(", ");
    // DEBUGSERIAL.print(sensorMPU6050.mpu6050_g.gyro.z); DEBUGSERIAL.print(", ");
    // DEBUGSERIAL.println("]");
  }

  if(DEBUGSERIAL.available() > 0) {
    float heading = DEBUGSERIAL.parseFloat(); // Reads integer from serial buffer

    if(sensorMPU6050.isCalibrated) {
      motion.setTargets(2.5, 0, heading);
      DEBUGSERIAL.print("Heading ");
      DEBUGSERIAL.print(motion.currentHeading);
      DEBUGSERIAL.print(" => ");
      DEBUGSERIAL.println(heading);
    }
  }
}

bool robotControllerTimerHandler(struct repeating_timer *t)
{
  if(sensorMPU6050.isCalibrated ) {
    //float turnRate = (sensorMPU6050.currentValues.gz * _timerIntervalSeconds);
    float velocity = (sensorMPU6050.currentValues.ay * _timerIntervalSeconds);
    float heading = (sensorMPU6050.currentValues.gx);

    motion.updateFromTimer(_timerIntervalSeconds, heading, velocity);
  }

  return true;
}