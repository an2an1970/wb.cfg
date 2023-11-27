let T0=10; // заполнение системы
let T1=30; // вода
let T2=5;  // ожидание
let T3=30; // детергент
let T4=5;  // ожидание
let T5=40; // воздух

let query=function (oledText, htmlText) {
  swMenu({sw:{
    "0":{
      short:{t:"/query/click", d:{action:"complete"}}, 
      long:{t:"/query/click", d:{action:"abort"}}, 
      pattern:0x00ff00ff 
    } 
  }});
  let ret=requestAction(oledText, htmlText);
  swMenu({sw:{}});
  return ret;
};

let air=function () {
  valve1(false); valve2(false);
  pump1(-bloodPumpSpeed()); pump2(1);
  progress("Воздух", "Прокачка воздуха", T5);
  pump1(0); pump2(0);
};

let wait=function (t) {
  pump1(0); pump2(0);
  progress("Ожидание", "Ожидание", t);
};

let mm=function () {
  swMenu({sw:{
    "0":{
      pattern:-1,
      short:{t:"/run/js", d:{"script":"exp(900,1);"}},
      long:{t:"/run/js", d:{"script":"exp(300,10);"}}, 
    }, 
    "1":{pattern:0}, 
    "2":{pattern:0} 
  }});
};

let clean=function() {
  liftClose();
  valve1(true); valve2(true);
  pump2(1); pump1(-bloodPumpSpeed());
  progress("Детергент", "Детергент", T1);
  wait(T2);
  air();
  valve1(false); valve2(true);
  pump2(1); pump1(-bloodPumpSpeed());
  progress("Вода", "Вода", T3);
  pump1(0); pump2(0);
  wait(T4);
  air();
  liftOpen();
  query("\x0C\xDB Удалите\n  стекло", "Пожалуйста, удалите стекло");
};

let exp=function (d, s) {
  pump1(0); pump2(0);
  progress("\x0CПодготовка", "Подготовка", 8);
  liftOpen();
  query("\x0C\xDC Поставьте\n  стекло", "Пожалуйста, поставьте стекло");
  liftClose();
  query("\x0C\xDC Поставьте\n  образец", "Пожалуйста, поставьте образец");

  pump1(0); pump2(0);
  pump1(bloodPumpSpeed());
  progress("\x0CЗаполнение", "Заполнение", T0);
  pump1(bloodPumpSpeed());
  swMenu({sw:{"0":{
    short:{t:"/query/click", d:{action:"complete"}}, 
    long:{t:"/query/click", d:{action:"abort"}}, 
    pattern:0x33333333 
  }}});
  experiment(d, s);
  pump1(0); pump2(0);

  query("\x0C\xDB Удалите\n  образец", "Пожалуйста, удалите образец");

  air();

  if (!query("\x0CЗаменить\nстекло?", "Хотите заменить стекло?")) {
    liftOpen();
    query("\x0C\xDC Замените\n  стекло", "Пожалуйста, замените стекло");
    liftClose();
  }

  clean();

  oledPrint("\x0CReady");
  reboot();
};
mm();
"Script loaded";
