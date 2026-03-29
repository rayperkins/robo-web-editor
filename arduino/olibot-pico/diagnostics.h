#ifndef DIAGNOSTICS_H
#define DIAGNOSTICS_H

#define DEBUGSERIAL Serial1

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

#endif //DIAGNOSTICS_H