'use strict';

class Synchronizer {
    constructor(config, wrapper) {
        this.config = config;
        this.wrapper = wrapper;
        this.intervalId = null;
    }
    start(callbackBefore, callbackAfter) {
        this.stop();
        this.intervalId = setInterval(() => {
            callbackBefore();
            this.wrapper.onSync((state) => callbackAfter(state), false); 
        }, this.config.getUpdateTimeout() * 1000);
    }
    stop() {
        if(this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

module.exports = Synchronizer;