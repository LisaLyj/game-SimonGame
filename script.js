var Simon = {
    switchOn: false,         // switch on / off
    started: false,          // start / stop
    strict: false,           // strict mode on / off
    count: 0,
    counter: 0,
    timer: null,
    curPlayer: false,         // false: simon play, true: you play.
    simonKeys: [],
    userKeys: [],

    switchDom: null,
    startDom: null,
    strictDom: null,
    countDom: null,
    keyDom: null,
    audioGreenDom: null,
    audioRedDom: null,
    audioYellowDom: null,
    audioBlueDom: null,
    countDom: null,

    init: function() {
        this.switchDom = document.getElementById("pwr-sw");
        this.startDom = document.getElementById("start");
        this.strictDom = document.getElementById("strict");
        this.countDom = document.querySelector(".count");
        this.keyDom = document.getElementsByClassName("key");
        this.audioGreenDom = document.getElementById("green");
        this.audioRedDom = document.getElementById("red");
        this.audioYellowDom = document.getElementById("yellow");
        this.audioBlueDom = document.getElementById("blue");
        this.countDom = document.querySelector(".count");

        this.switchDom.addEventListener("click", function() {
            this.classList.toggle('sw-on');
            Simon.switchOn = !Simon.switchOn;      // toggle switch
            Simon.reset();
            if (!Simon.switchOn) {
                Simon.started = false;
                Simon.strict = false;
                Simon.startDom.classList.remove("red-on");
                Simon.strictDom.classList.remove("yellow-on");
                Simon.countDom.classList.add("led-off");
            } else {
                Simon.countDom.classList.remove("led-off");
                Simon.showStartMsg("--");
            }
        });

        this.startDom.addEventListener("click", function() {
            if (Simon.switchOn) {
                this.classList.toggle("red-on");
                Simon.started = !Simon.started;    // toggle started
                Simon.reset();
            }
            if (Simon.started) {
                Simon.countUp();
                Simon.generateSimonKeys();
            } else {
                Simon.strict = false;
                Simon.strictDom.classList.remove("yellow-on");
                Simon.countDom.textContent = "--";
            }
        });

        this.strictDom.addEventListener("click", function() {
            if (Simon.started) {
                this.classList.toggle("yellow-on");
                Simon.strict = !Simon.strict;
            }
            if (Simon.strict) {
                Simon.reset();
                Simon.countUp();
                Simon.generateSimonKeys();
            }
        });

        Array.from(this.keyDom).forEach(function(obj) {
            //obj.classList.remove("unclickable");
            obj.addEventListener("click", function(e) {
                Simon.playKey(e);
                Simon.compare(e.target.classList[2]);
            });
            obj.addEventListener("transitionend", function(e) {
                this.classList.remove("light");
            });
        });
    },

    playKey: function(event) {
        var clt = event.target.classList;
        clt.add("light");
        switch (clt[2]) {
            case "green":
              Simon.audioGreenDom.play();
              break;
            case "red":
              Simon.audioRedDom.play();
              break;
            case "yellow":
              Simon.audioYellowDom.play();
              break;
            case "blue":
              Simon.audioBlueDom.play();
              break;
            default:
              break;
        }
        if (Simon.curPlayer) {
            Simon.userKeys.push(clt[2]);
        }
    },

    keyClickable: function() {
        Array.from(this.keyDom).forEach(function(obj) {
            obj.classList.remove("unclickable");
        });
    },

    keyUnclickable: function() {
        Array.from(this.keyDom).forEach(function(obj) {
            obj.classList.add("unclickable");
        });
    },

    generateSimonKeys: function() {
        Simon.simonKeys = [];
        for (var i = 0; i < Simon.count; i++) {
            var index = Math.floor(Math.random() * Simon.keyDom.length);
            Simon.simonKeys.push(index);
        }
    },

    simonPlay: function() {
        this.curPlayer = false;
        this.counter = 0;
        this.timer = setTimeout(function run() {
          if (Simon.counter >= Simon.count) {
            clearTimeout(Simon.timer);
            Simon.timer = setTimeout(Simon.waitUserPlay, 500);
          } else {
            var index = Simon.simonKeys[Simon.counter];
            Simon.keyDom[index].click();
            ++Simon.counter;
            Simon.timer = setTimeout(run, 1000);
          }
        }, 1000);
    },

    countUp: function() {
        Simon.keyUnclickable();
        ++this.count;
        this.showMsg(this.count);
    },

    compare: function(userKey) {
        if (!Simon.curPlayer)  return;
        clearTimeout(Simon.timer);
        var index = Simon.userKeys.length - 1;
        if (Simon.userKeys[index] !== Simon.keyDom[Simon.simonKeys[index]].classList[2]) {
            Simon.userKeys = [];
            Simon.showErrMsg();
        } else if (Simon.userKeys.length == Simon.simonKeys.length) {
            Simon.userKeys = [];
            Simon.countUp();
            Simon.generateSimonKeys();
        }
    },

    waitUserPlay: function() {
        Simon.curPlayer = true;
        Simon.keyClickable();
        var timeout = 1000 * Simon.simonKeys.length + 3000;
        Simon.timer = setTimeout(function() {
            if (Simon.userKeys.length == 0) {
                Simon.curPlayer = false;
                Simon.timer = setTimeout(function() {
                    Simon.showMsg(Simon.count);
                }, 1000);
            }
        }, timeout);
    },

    showMsg: function(msg) {
        var i = 0;
        this.countDom.textContent = msg;
        Simon.timer = setTimeout(function run() {
            if (i < 4) {
                Simon.countDom.classList.toggle("led-off");
                Simon.timer = setTimeout(run, 200);
                i++;
            } else {
                clearTimeout(Simon.timer);
                Simon.timer = setTimeout(function() {
                    Simon.simonPlay();
                }, 500);
            }
        }, 200);
    },

    showStartMsg: function() {
        var i = 0;
        this.countDom.textContent = "--";
        Simon.timer = setTimeout(function run() {
            if (i < 4) {
                Simon.countDom.classList.toggle("led-off");
                Simon.timer = setTimeout(run, 200);
                i++;
            } else {
                clearTimeout(Simon.timer);
            }
        }, 200);
    },

    showErrMsg: function() {
        Simon.keyUnclickable();
        var i = 0;
        this.countDom.textContent = "!!";
        Simon.timer = setTimeout(function run() {
            if (i < 4) {
                Simon.countDom.classList.toggle("led-off");
                Simon.timer = setTimeout(run, 200);
                i++;
            } else {
                clearTimeout(Simon.timer);
                if (Simon.strict) {
                    Simon.count = 1;
                    Simon.generateSimonKeys();
                }
                Simon.showMsg(Simon.count);
            }
        }, 200);
    },

    reset: function() {
        if (Simon.timer) clearTimeout(Simon.timer);
        Simon.count = 0;
        Simon.curPlayer = false;
        Simon.simonKeys = [];
        Simon.userKeys = [];
    }
};

window.onload = function() {
    Simon.init();
};