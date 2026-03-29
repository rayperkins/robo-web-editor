#ifndef OLIBOTMOTION_H
#define OLIBOTMOTION_H

#define MOTOR_PWM_MIN 70
#define MOTOR_PWM_MAX 127 //127
// Motor A
#define motorAPin1 21 // IN1
#define motorAPin2 20 // IN2
// Motor Bc:\repos\Learning\robo-web-editor\arduino\olibot-pico\sensors\sensorMPU6050.h
#define motorBPin1 18 // IN3
#define motorBPin2 19  // IN4

enum MotorLabel { MotorA, MotorB };  // Right, Left

class OlibotMotion
{
public:
  int currentRightMotorSpeed = 0;
  int currentLeftMotorSpeed = 0;
  float currentDistance = 0;
  float currentHeading = 0;
  float currentVelocity = 0;
  float runIntervalSeconds = 0;

  void setup()
  {
    // motor contro pins
    pinMode(motorAPin1, OUTPUT);
    pinMode(motorAPin2, OUTPUT);
    pinMode(motorBPin1, OUTPUT);
    pinMode(motorBPin2, OUTPUT);
    digitalWrite (motorAPin1, LOW);
    digitalWrite (motorAPin2, LOW);
    digitalWrite (motorBPin1, LOW);
    digitalWrite (motorBPin2, LOW);

    // setup pwm
    analogWriteFreq(16000);
    analogWriteRange(MOTOR_PWM_MAX);
  }

  void setMotorValue(MotorLabel motor, int value)
  {
    int motorPin1 = motor == MotorA ? motorAPin1 : motorBPin1;
    int motorPin2 = motor == MotorA ? motorAPin2 : motorBPin2;

    analogWrite(motorPin1, 0);
    analogWrite(motorPin2, 0);  
    
    if(value < 0)
    {
      digitalWrite(motorPin2, LOW);
      analogWrite(motorPin1, constrain((value * -1), 0, MOTOR_PWM_MAX));  
    }
    else if(value > 0)
    {
      analogWrite(motorPin2, constrain((value), 0, MOTOR_PWM_MAX));  
      digitalWrite(motorPin1, LOW);
    }
    else
    {
      digitalWrite(motorPin1, LOW);
      digitalWrite(motorPin2, LOW);
    }
  }

  void setTargets(float runTime, float speed, float heading) {
    runIntervalSeconds = constrain(runTime, 0, 5);
    //currentHeading = 0;
    currentDistance = 0;
    _currentRuntimeSeconds = 0;
    //_targetHeading = constrain(heading, -360, 360);//constrain(heading, -6.2832, 6.2832); // 360 degrees
    _targetSpeed = constrain(speed, -100, 100);

    _targetHeading = currentHeading + constrain(heading, -360, 360);
    if(_targetHeading > 360) {
      _targetHeading -= 360;
    }
    else if(_targetHeading < -360) {
      _targetHeading += 360;
    }
  }

  void updateFromTimer(float timerIntervalSeconds, float heading, float velocity)
  {
    // update the rate of turn
    // negative gyro Z means turning to the right
    //currentHeading += turnRate;
    currentHeading = -heading;
    currentVelocity += velocity;
    currentDistance += velocity;
    _currentRuntimeSeconds += timerIntervalSeconds;

    if(runIntervalSeconds > 0) {
      runIntervalSeconds -= timerIntervalSeconds;

      float motorSpeed = _targetSpeed;

      float headingDelta = _targetHeading - currentHeading;// * 0.0001745329; // 1.5708 = 90 degrees

      // short circuit if about right on the heading
      if(runIntervalSeconds > 0.100
        && abs(headingDelta) < 1.0) {
        headingDelta = 0;
      }

      float leftMotorSpeed = (motorSpeed) + (headingDelta);
      float rightMotorSpeed = (motorSpeed) - (headingDelta);

      // update motor output with applied deadband limits
      currentLeftMotorSpeed = leftMotorSpeed == 0
        ? 0
        : (leftMotorSpeed > 0 ? map(leftMotorSpeed, 0, 100, MOTOR_PWM_MIN, MOTOR_PWM_MAX) :  map(leftMotorSpeed, -100, 0, -MOTOR_PWM_MAX, -MOTOR_PWM_MIN));  //constrain(leftMotorSpeed, -127, 127);
      currentRightMotorSpeed = rightMotorSpeed == 0
        ? 0
        : (rightMotorSpeed > 0 ? map(rightMotorSpeed, 0, 100, MOTOR_PWM_MIN, MOTOR_PWM_MAX) : map(rightMotorSpeed, -100, 0, -MOTOR_PWM_MAX, -MOTOR_PWM_MIN));  //constrain(rightMotorSpeed, -127, 127);
    }
    else {
      runIntervalSeconds = 0;
      currentLeftMotorSpeed = 0;
      currentRightMotorSpeed = 0;
    }
  
    setMotorValue(MotorB, currentLeftMotorSpeed);
    setMotorValue(MotorA, currentRightMotorSpeed);
  } 

private:
  float _targetHeading = 0;
  float _targetSpeed = 0;
  float _currentRuntimeSeconds = 0;
};

#endif // OLIBOTMOTION_H