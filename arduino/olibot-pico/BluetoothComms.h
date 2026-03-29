#ifndef BLUETOOTHCOMMS_H
#define BLUETOOTHCOMMS_H

#include <BTstackLib.h>
#include "diagnostics.h"
#include "olibotTypes.h"
#include "olibot_code_interpreter.h"

const uint8_t adv_data[] = {
  // Flags general discoverable
  0x02, 0x01, 0x02,
  // Name
  0x05, 0x09, 'O', 'L', 'I', 'B',
  // Service Solicitation, 128-bit UUIDs - 0000ffe0-0000-1000-8000-00805f9b34fb TODO: check if ANCS (little endian)
  //0x11, 0x15, 0x00, 0x00, 0xff, 0xe0, 0x00, 0x00, 0x10, 0x00, 0x80, 0x00, 0x00, 0x80, 0x5f, 0x9b, 0x34, 0xfb
};

static uint16_t characteristic_data_length;
static char characteristic_data_buffer[40];

class BluetoothComms
{
public:
  bool isAvailable = false;

  void setup()
  {
    BTstack.setup("Olibot");
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

    isAvailable = true;
  }

  void onLoop()
  {
    BTstack.loop();

    char charBuffer[21]; //most we would ever see in a ble packet
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

      // n = charBuffer[numberOfBytesReceived-1]-'0';
      // n = constrain(n, 0, 5);

      // if (strstr(charBuffer, "forward") == &charBuffer[0]) {
      //   command = "forward";
      // }   
      // else if (strstr(charBuffer, "backward") == &charBuffer[0]) {
      //   command = "backward";
      // }
      // else if (strstr(charBuffer, "right") == &charBuffer[0]) {
      //   command = "right";
      // }
      // else if (strstr(charBuffer, "left") == &charBuffer[0]) {
      //   command = "left";
      // }
      // else if (strstr(charBuffer, "stop") == &charBuffer[0]) {
      //   command = "";
      //   Stop();
      //   codeInterpreter.stop();
      // }
      // else if (strstr(charBuffer, "ultrasound") == &charBuffer[0]) {
      //   Stop();
      //   //bluetooth.print(ultrasound_value); // need to work out how to notify
      // }
      // else if (strstr(charBuffer, "avoidance") == &charBuffer[0]) {
      //   command = "avoidance";
      // }
      // else if (strstr(charBuffer, "force") == &charBuffer[0]) {
      //   command = "force";
      // }
      // else if (strstr(charBuffer, "happy") == &charBuffer[0]) {
      //   command = "";
      //   Ottobot.playGesture(OttoSuperHappy);
      // }
      // else if (strstr(charBuffer, "victory") == &charBuffer[0]) {
      //   command = "";
      //   Ottobot.playGesture(OttoVictory);
      // }
      // else if (strstr(charBuffer, "sad") == &charBuffer[0]) {
      //   command = "";
      //   Ottobot.playGesture(OttoSad);
      // }
      // else if (strstr(charBuffer, "sleeping") == &charBuffer[0]) {
      //   command = "";
      //   Ottobot.playGesture(OttoSleeping);
      // }
      // else if (strstr(charBuffer, "confused") == &charBuffer[0]) {
      //   command = "";
      //   Ottobot.playGesture(OttoConfused);
      // }
      // else if (strstr(charBuffer, "fail") == &charBuffer[0]) {
      //   command = "";
      //   Ottobot.playGesture(OttoFail);
      // }
      // else if (strstr(charBuffer, "fart") == &charBuffer[0]) {
      //   command = "";
      //   Ottobot.playGesture(OttoFart);
      // }
      // else if (strstr(charBuffer, "C") == &charBuffer[0]) {
        
      //   if (calibration == false) {
      //     Ottobot._moveServos(10, positions);
      //     calibration = true;
      //     delay(50);
      //   } 
      //   command = "calibration";
      //   Calibration(charBuffer);
      // }
      // else if (strstr(charBuffer, "walk_test") == &charBuffer[0]) {
      //   command = "";
      //   Ottobot.walk(3, 1000, FORWARD);
      // }
      // else if (strstr(charBuffer, "save_calibration") == &charBuffer[0]) {
      //   command = "";
      //   readChar('s');
      // }
      // else if (strstr(charBuffer, "clear") == &charBuffer[0]) {
      //   codeInterpreter.clearInstructions();
      // }
      // else if (strstr(charBuffer, "start") == &charBuffer[0]) {
      //   PrintDebug("starting program, index: %d, count: %d", codeInterpreter._instructionIndex, codeInterpreter._instructionCount);

      //   for(int i = 0; i < codeInterpreter._instructionCount; i++) {
      //     PrintDebug(codeInterpreter._instructions[i]);
      //   }

      //   codeInterpreter.start();
      // }
      // // interpreter commands
      // else if (strstr(charBuffer, "set") == &charBuffer[0]
      //   && isdigit(charBuffer[3])) {
      //   // command in the form 'set9999 add -32768'
      //   // first loop out the index number after 'set'
      //   char chIndex = 3;
      //   char instructionIndex = 0;

      //   while(chIndex < numberOfBytesReceived) {
      //     if(!isdigit(charBuffer[chIndex])) {
      //       break;
      //     }

      //     // for each digit, shift the previous digit up by 10 and add the new
      //     instructionIndex *= 10;
      //     instructionIndex += charBuffer[chIndex] - 0x30;
      //     chIndex++;
      //   }

      //   // now chIndex should point at the the space after the index number
      //   // validate this and treat the remaining chars as the instruction
      //   if(charBuffer[chIndex] == ' ') {
      //     chIndex++;
      //     codeInterpreter.setInstruction(instructionIndex, &charBuffer[chIndex], numberOfBytesReceived - chIndex);
      //   }
      // }
    }

  }

  static void deviceConnectedCallback(BLEStatus status, BLEDevice *device) {
    (void) device;
    switch (status) {
      case BLE_STATUS_OK:
        PrintDebug("Device connected!");
        break;
      default:
        break;
    }
  }

  static void deviceDisconnectedCallback(BLEDevice * device) {
    (void) device;
    PrintDebug("Disconnected.");
  }

  static uint16_t gattReadCallback(uint16_t value_handle, uint8_t * buffer, uint16_t buffer_size) {
    (void) value_handle;
    (void) buffer_size;

    if (buffer) {
      olibotReadData_t readData;
      readData.version = 1;
      // readData.state = (botStateFlag_t)((codeInterpreter.isEnabled() && !codeInterpreter.completed()) ? PROGRAM_RUNNING : 0);
      // // calibration
      // readData.trimLeftLeg = OttoConfig.current.trimLeftLeg;
      // readData.trimRightLeg = OttoConfig.current.trimRightLeg;
      // readData.trimLeftFoot = OttoConfig.current.trimLeftFoot;
      // readData.trimRightFoot = OttoConfig.current.trimRightFoot;
      // // sensors
      // readData.sensor_distance = sensors.distance;

      memcpy(buffer, (void*)&readData, sizeof(olibotReadData_t));
    }

    return sizeof(olibotReadData_t);
  }

  static int gattWriteCallback(uint16_t value_handle, uint8_t *buffer, uint16_t size) {
    (void) value_handle;
    (void) size;

    memcpy(characteristic_data_buffer, buffer, size);
    characteristic_data_length = size;
    
    PrintDebug("gattWriteCallback , size: %d", size);

    return 0;
  }

private:
  /* ble Advertisement */

};

#endif //BLUETOOTHCOMMS_H