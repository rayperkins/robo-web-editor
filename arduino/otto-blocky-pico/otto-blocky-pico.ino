/*  
*                        
*    ______________      ____                                _____    _  _     _
*   |   __     __  |    / __ \ _________ _________   ____   |  __ \  | | \\   //  
*   |  |__|   |__| |   | |  | |___   ___ ___   ___  / __ \  | |  | | | |  \\ //  
*   |_    _________|   | |  | |   | |       | |    | |  | | | |  | | | |   | |
*   | \__/         |   | |__| |   | |       | |    | |__| | | |__| | | |   | |
*   |              |    \____/    |_|       |_|     \____/  |_____/  |_|   |_|
*   |_    _________|
*     \__/            
*
*    This Sketch was created to control Otto Starter with the Offical Web Bluetooth Controller for Otto DIY Robots.
*    For any question about this script you can contact us at education@ottodiy.com
*    By: Iván R. Artiles
*/

#include <Otto.h>
#include <EEPROM.h>
#include <BTstackLib.h>
#include "otto_config.h"
#include "otto_sensors.h"

#define LEFTLEG 21
#define RIGHTLEG 19
#define LEFTFOOT 20
#define RIGHTFOOT 18
#define BUZZER 14

static uint16_t characteristic_data_length = 0;
static char characteristic_data_buffer[40];

int move_speed[] = {3000, 2000, 1000, 750, 500, 250};
int n = 2;
int ultrasound_threeshold = 4;
long ultrasound_value = 0;
String command = "";

int v;
int ch;
int i;
int positions[] = {90, 90, 90, 90};
unsigned long sync_time = 0;

/* ble Advertisement */
const uint8_t adv_data[] = {
  // Flags general discoverable
  0x02, 0x01, 0x02,
  // Name
  0x05, 0x09, 'O', 'T', 'T', 'O',
  // Service Solicitation, 128-bit UUIDs - 0000ffe0-0000-1000-8000-00805f9b34fb
  0x11, 0x15, 0x00, 0x00, 0xff, 0xe0, 0x00, 0x00, 0x10, 0x00, 0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb
};

bool calibration = false;
  
Otto Ottobot;
OttoSensors sensors;

// SENSORS IN CORE 1
void setup1() {
  sensors.setup();
}

void loop1() {
  sensors.loop();
}

// MAIN APP IN CORE 0
void setup() {
  rp2040.idleOtherCore();
  OttoConfig.setup();

  rp2040.resumeOtherCore();

  Serial.begin(9600);

  Ottobot.init(LEFTLEG, RIGHTLEG, LEFTFOOT, RIGHTFOOT, false, BUZZER);
  if(OttoConfig.isValid) {
    Ottobot.setTrims(OttoConfig.current.trimLeftLeg, OttoConfig.current.trimRightLeg, OttoConfig.current.trimLeftFoot, OttoConfig.current.trimRightFoot);
  }

  BTstack.setup("Otto");
  // set callbacks
  BTstack.setBLEDeviceConnectedCallback(deviceConnectedCallback);
  BTstack.setBLEDeviceDisconnectedCallback(deviceDisconnectedCallback);
  BTstack.setGATTCharacteristicRead(gattReadCallback);
  BTstack.setGATTCharacteristicWrite(gattWriteCallback);

  // setup GATT Database
  BTstack.addGATTService(new UUID("0000ffe0-0000-1000-8000-00805f9b34fb")); // SPP service UUID 
  // SPP data UUID: fec26ec4-6d71-4442-9f81-55bc21d658d6

  // BTstack.addGATTCharacteristicDynamic(new UUID("6E400002-B5A3-F393-E0A9-E50E24DCCA9E"), ATT_PROPERTY_WRITE, 0); //RX
  // BTstack.addGATTCharacteristicDynamic(new UUID("6E400003-B5A3-F393-E0A9-E50E24DCCA9E"), ATT_PROPERTY_NOTIFY, 0); //TX
  BTstack.addGATTCharacteristicDynamic(new UUID("0000ffe1-0000-1000-8000-00805f9b34fb"), ATT_PROPERTY_WRITE | ATT_PROPERTY_NOTIFY, 0); //RX

  // startup Bluetooth and activate advertisements

  BTstack.setAdvData(sizeof(adv_data), adv_data);
  BTstack.startAdvertising();
  
  Ottobot.home();
  v = 0;
}

void loop() {
  //Ottobot.walk(1, move_speed[n], FORWARD);
  BTstack.loop();
  checkBluetooth();//if something is coming at us
  
  if (command == "forward") {
    Forward();
  }
  else if (command == "backward") {
    Backward();
  }
  else if (command == "right") {
    Right();
  }
  else if (command == "left") {
    Left();
  }
  else if (command == "avoidance") {
    Avoidance();
  }
  else if (command == "force") {
    UseForce();
  }
}

void deviceConnectedCallback(BLEStatus status, BLEDevice *device) {
  (void) device;
  switch (status) {
    case BLE_STATUS_OK:
      PrintDebug("Device connected!");
      break;
    default:
      break;
  }
}

void deviceDisconnectedCallback(BLEDevice * device) {
  (void) device;
  PrintDebug("Disconnected.");
}

uint16_t gattReadCallback(uint16_t value_handle, uint8_t * buffer, uint16_t buffer_size) {
  (void) value_handle;
  (void) buffer_size;
  if (buffer) {
    PrintDebug("gattReadCallback, size: %d", buffer_size);
    buffer[0] = 0;
  }
  return 1;
}

int gattWriteCallback(uint16_t value_handle, uint8_t *buffer, uint16_t size) {
  (void) value_handle;
  (void) size;

  memcpy(characteristic_data_buffer, buffer, size);
  characteristic_data_length = size;
  
  PrintDebug("gattWriteCallback , size: %d", size);

  return 0;
}

void checkBluetooth() {
  char charBuffer[20];//most we would ever see
  
  if (characteristic_data_length > 0) {
    int numberOfBytesReceived = characteristic_data_length < 20 ? characteristic_data_length : 19;
    memcpy(charBuffer, characteristic_data_buffer, numberOfBytesReceived);

    characteristic_data_length = 0; // clear read buffer

    // trim whitespace from end
    while(numberOfBytesReceived > 0 
      && charBuffer[numberOfBytesReceived-1] <= 0x20)
    {
      numberOfBytesReceived --;
    }

    charBuffer[numberOfBytesReceived] = '\0';
    n = charBuffer[numberOfBytesReceived-1]-'0';
    
    PrintDebug("Received: '");
    PrintDebug(charBuffer);

    n = constrain(n, 0, 5);
    if (strstr(charBuffer, "forward") == &charBuffer[0]) {
      command = "forward";
    }   
    else if (strstr(charBuffer, "backward") == &charBuffer[0]) {
      command = "backward";
    }
    else if (strstr(charBuffer, "right") == &charBuffer[0]) {
      command = "right";
    }
    else if (strstr(charBuffer, "left") == &charBuffer[0]) {
      command = "left";
    }
    else if (strstr(charBuffer, "stop") == &charBuffer[0]) {
      command = "stop";
      Stop();
    }
    else if (strstr(charBuffer, "ultrasound") == &charBuffer[0]) {
      Stop();
      //bluetooth.print(ultrasound_value); // need to work out how to notify
    }
    else if (strstr(charBuffer, "avoidance") == &charBuffer[0]) {
      command = "avoidance";
    }
    else if (strstr(charBuffer, "force") == &charBuffer[0]) {
      command = "force";
    }
    else if (strstr(charBuffer, "happy") == &charBuffer[0]) {
      command = "";
      Ottobot.playGesture(OttoSuperHappy);
    }
    else if (strstr(charBuffer, "victory") == &charBuffer[0]) {
      command = "";
      Ottobot.playGesture(OttoVictory);
    }
    else if (strstr(charBuffer, "sad") == &charBuffer[0]) {
      command = "";
      Ottobot.playGesture(OttoSad);
    }
    else if (strstr(charBuffer, "sleeping") == &charBuffer[0]) {
      command = "";
      Ottobot.playGesture(OttoSleeping);
    }
    else if (strstr(charBuffer, "confused") == &charBuffer[0]) {
      command = "";
      Ottobot.playGesture(OttoConfused);
    }
    else if (strstr(charBuffer, "fail") == &charBuffer[0]) {
      command = "";
      Ottobot.playGesture(OttoFail);
    }
    else if (strstr(charBuffer, "fart") == &charBuffer[0]) {
      command = "";
      Ottobot.playGesture(OttoFart);
    }
    else if (strstr(charBuffer, "C") == &charBuffer[0]) {
      
      if (calibration == false) {
        Ottobot._moveServos(10, positions);
        calibration = true;
        delay(50);
      } 
      command = "calibration";
      Calibration(charBuffer);
    }
    else if (strstr(charBuffer, "walk_test") == &charBuffer[0]) {
      command = "";
      Ottobot.walk(3, 1000, FORWARD);
    }
    else if (strstr(charBuffer, "save_calibration") == &charBuffer[0]) {
      command = "";
      readChar('s');
    }
  }
}

void Forward() {
  Ottobot.walk(1, move_speed[n], FORWARD);
}

void Backward() {
  Ottobot.walk(1, move_speed[n], BACKWARD);
}

void Right() {
  Ottobot.walk(1, move_speed[n], RIGHT);
}

void Left() {
  Ottobot.walk(1, move_speed[n], LEFT);
}

void Stop() {
  Ottobot.home();
}

void Avoidance() {
  if (sensors.distance <= OttoConfig.current.distanceThreshold) {
    Ottobot.playGesture(OttoConfused);
    for (int count=0 ; count<2 ; count++) {
      Ottobot.walk(1,move_speed[n],-1); // BACKWARD
    }
    for (int count=0 ; count<4 ; count++) {
      Ottobot.turn(1,move_speed[n],1); // LEFT
    }
  }
  Ottobot.walk(1,move_speed[n],1); // FORWARD
}

void UseForce() {
  if (sensors.distance <= OttoConfig.current.distanceThreshold) {
      Ottobot.walk(1,move_speed[n],-1); // BACKWARD
    }
    if ((sensors.distance > 10) && ( sensors.distance < 15)) {
      Ottobot.home();
    }
    if ((sensors.distance > 15) && ( sensors.distance < 30)) {
      Ottobot.walk(1,move_speed[n],1); // FORWARD
    }
    if (sensors.distance> 30) {
      Ottobot.home();
    }  
}

void Settings(String ts_ultrasound) {
  OttoConfig.current.distanceThreshold = ts_ultrasound.toInt();
}

void Calibration(String c) {
  if (sync_time < millis()) {
      sync_time = millis() + 50;
      for (int k = 1; k < c.length(); k++) {
        readChar((c[k]));
      }
  } 
}

void readChar(char ch) {
  switch (ch) {
  case '0'...'9':
    v = (v * 10 + ch) - 48;
    break;
   case 'a':
    OttoConfig.current.trimLeftLeg = v-90;
    setTrims();
    v = 0;
    break;
   case 'b':
    OttoConfig.current.trimRightLeg = v-90;
    setTrims();
    v = 0;
    break;
   case 'c':
    OttoConfig.current.trimLeftFoot = v-90;
    setTrims();
    v = 0;
    break;
   case 'd':
    OttoConfig.current.trimRightFoot = v-90;
    setTrims();
    v = 0;
    break;
   case 's':
    OttoConfig.Save();
    delay(500);
    Ottobot.sing(S_superHappy);
    Ottobot.crusaito(1, 1000, 25, -1);
    Ottobot.crusaito(1, 1000, 25, 1);
    Ottobot.sing(S_happy_short);
    break;
  }
}

void setTrims() {
  Ottobot.setTrims(OttoConfig.current.trimLeftLeg, OttoConfig.current.trimRightLeg, OttoConfig.current.trimLeftFoot, OttoConfig.current.trimRightFoot);
  Ottobot._moveServos(10, positions); 
}


void PrintDebug(const char* input...) {
  va_list args;
  va_start(args, input);
  for(const char* i=input; *i!=0; ++i) {
    if(*i!='%') { Serial.print(*i); continue; }
    switch(*(++i)) {
      case '%': Serial.print('%'); break;
      case 's': Serial.print(va_arg(args, char*)); break;
      case 'd': Serial.print(va_arg(args, int), DEC); break;
      case 'b': Serial.print(va_arg(args, int), BIN); break;
      case 'o': Serial.print(va_arg(args, int), OCT); break;
      case 'x': Serial.print(va_arg(args, int), HEX); break;
      case 'f': Serial.print(va_arg(args, double), 2); break;
    }
  }
  Serial.println();
  va_end(args);
}