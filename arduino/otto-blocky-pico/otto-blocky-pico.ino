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
#include "otto_code_interpreter.h"

#define LEFTLEG 21
#define RIGHTLEG 19
#define LEFTFOOT 20
#define RIGHTFOOT 18
#define BUZZER 14

#define DEBUGSERIAL Serial

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
  // Service Solicitation, 128-bit UUIDs - 0000ffe0-0000-1000-8000-00805f9b34fb TODO: check if ANCS (little endian)
  //0x11, 0x15, 0x00, 0x00, 0xff, 0xe0, 0x00, 0x00, 0x10, 0x00, 0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb
};

typedef enum  {
    PROGRAM_RUNNING = 1,
} botStateFlag_t;

typedef struct botreaddata {
  uint8_t version;
  botStateFlag_t state;
  uint8_t reserved0;
  uint8_t reserved1;
  // calibration, 0 - 255
  int8_t trimLeftLeg;
  int8_t trimRightLeg;
  int8_t trimLeftFoot;
  int8_t trimRightFoot;
  // sensors
  uint16_t sensor_distance;
} botreaddata_t;

bool calibration = false;
bool setupDone = false;
  
Otto Ottobot;
OttoSensors sensors;
OttoCodeInterpreter codeInterpreter;

// SENSORS IN CORE 1
void setup1() {
  sensors.setup();
  codeInterpreter.setup(&Ottobot, &sensors);
}

void loop1() {

  if(!setupDone) {
    return;
  }

  sensors.loop();
  codeInterpreter.loop();

  if(codeInterpreter.isEnabled() && !codeInterpreter.completed()) {

  }
  else if (command == "forward") {
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

// MAIN APP IN CORE 0
void setup() {
  //rp2040.idleOtherCore();
  OttoConfig.setup();  

  DEBUGSERIAL.begin(115200);

  Ottobot.init(LEFTLEG, RIGHTLEG, LEFTFOOT, RIGHTFOOT, false, BUZZER);
  if(OttoConfig.isValid) {
    Ottobot.setTrims(OttoConfig.current.trimLeftLeg, OttoConfig.current.trimRightLeg, OttoConfig.current.trimLeftFoot, OttoConfig.current.trimRightFoot);

    Ottobot.home();
  }

  //rp2040.resumeOtherCore();

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
  
  // commands
  BTstack.addGATTCharacteristicDynamic(new UUID("0000ffe1-0000-1000-8000-00805f9b34fb"), ATT_PROPERTY_WRITE | ATT_PROPERTY_READ, 0); //RX

  // startup Bluetooth and activate advertisements

  BTstack.setAdvData(sizeof(adv_data), adv_data);
  BTstack.startAdvertising();

  v = 0;
  setupDone = true;
}

void loop() {
  BTstack.loop();
  checkBluetooth(); //if something is coming at us
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
    botreaddata_t readData;
    readData.version = 1;
    readData.state = (botStateFlag_t)((codeInterpreter.isEnabled() && !codeInterpreter.completed()) ? PROGRAM_RUNNING : 0);
    // calibration
    readData.trimLeftLeg = OttoConfig.current.trimLeftLeg;
    readData.trimRightLeg = OttoConfig.current.trimRightLeg;
    readData.trimLeftFoot = OttoConfig.current.trimLeftFoot;
    readData.trimRightFoot = OttoConfig.current.trimRightFoot;
    // sensors
    readData.sensor_distance = sensors.distance;

    memcpy(buffer, (void*)&readData, sizeof(botreaddata_t));
  }

  return sizeof(botreaddata_t);
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
  char charBuffer[21];//most we would ever see
  
  if (characteristic_data_length > 0) {
    int numberOfBytesReceived = characteristic_data_length < 20 ? characteristic_data_length : 19;
    memset(charBuffer, 0, sizeof(charBuffer));
    memcpy(charBuffer, characteristic_data_buffer, numberOfBytesReceived);

    characteristic_data_length = 0; // clear read buffer

    // trim whitespace from end
    while(numberOfBytesReceived > 0 
      && charBuffer[numberOfBytesReceived-1] <= 0x20)
    {
      numberOfBytesReceived --;
    }

    charBuffer[numberOfBytesReceived] = '\0';
    
    PrintDebug("checkBluetooth: %s", charBuffer);

    n = charBuffer[numberOfBytesReceived-1]-'0';
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
      command = "";
      Stop();
      codeInterpreter.stop();
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
    else if (strstr(charBuffer, "clear") == &charBuffer[0]) {
      codeInterpreter.clearInstructions();
    }
    else if (strstr(charBuffer, "start") == &charBuffer[0]) {
      PrintDebug("starting program, index: %d, count: %d", codeInterpreter._instructionIndex, codeInterpreter._instructionCount);

      for(int i = 0; i < codeInterpreter._instructionCount; i++) {
        PrintDebug(codeInterpreter._instructions[i]);
      }

      codeInterpreter.start();
    }
    // interpreter commands
    else if (strstr(charBuffer, "set") == &charBuffer[0]
      && isdigit(charBuffer[3])) {
      // command in the form 'set9999 add -32768'
      // first loop out the index number after 'set'
      char chIndex = 3;
      char instructionIndex = 0;

      while(chIndex < numberOfBytesReceived) {
        if(!isdigit(charBuffer[chIndex])) {
          break;
        }

        // for each digit, shift the previous digit up by 10 and add the new
        instructionIndex *= 10;
        instructionIndex += charBuffer[chIndex] - 0x30;
        chIndex++;
      }

      // now chIndex should point at the the space after the index number
      // validate this and treat the remaining chars as the instruction
      if(charBuffer[chIndex] == ' ') {
        chIndex++;
        codeInterpreter.setInstruction(instructionIndex, &charBuffer[chIndex], numberOfBytesReceived - chIndex);
      }
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
    if(*i!='%') { DEBUGSERIAL.print(*i); continue; }
    switch(*(++i)) {
      case '%': DEBUGSERIAL.print('%'); break;
      case 's': DEBUGSERIAL.print(va_arg(args, char*)); break;
      case 'd': DEBUGSERIAL.print(va_arg(args, int), DEC); break;
      case 'b': DEBUGSERIAL.print(va_arg(args, int), BIN); break;
      case 'o': DEBUGSERIAL.print(va_arg(args, int), OCT); break;
      case 'x': DEBUGSERIAL.print(va_arg(args, int), HEX); break;
      case 'f': DEBUGSERIAL.print(va_arg(args, double), 2); break;
    }
  }
  DEBUGSERIAL.println();
  va_end(args);
}