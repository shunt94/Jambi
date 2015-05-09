/*
    Class: jambiTmer
    Purpose: control timers throughout jambi
*/
var jambiTimer = function($elementSeconds, $elementMins, $elementHours){
    // init the seconds, minutes and hours to 0
	var jambi_timer_seconds = 0;
	var jambi_timer_minutes = 0;
	var jambi_timer_hours = 0;

	var jambi_timer;

	/*
        Method: start()
        Purpose: starts the timer
    */
	function start() {
		jambi_timer = setInterval(jambiTimer1, 1000);
	}

	/*
        Method: stop()
        Purpose: stops the timer
    */
	function stop() {
		clearInterval(jambi_timer);
	}

	/*
        Method: updateMinutes()
        Purpose: increments the minutes
    */
	function updateMinutes() {
		jambi_timer_minutes = ("0" + Number(jambi_timer_minutes)).slice(-2);
		$($elementMins).text(jambi_timer_minutes);
	}

    /*
        Method: updateTime()
        Purpose: update the muns and hours
    */
	function updateTime() {
		jambi_timer_minutes = ("0" + Number(jambi_timer_minutes)).slice(-2);
		$($elementMins).text(jambi_timer_minutes);
		jambi_timer_hours = ("0" + Number(jambi_timer_hours)).slice(-2);
		$($elementHours).text(jambi_timer_hours);
	}

    /*
        Method: updateSeconds
        Purpose: update the seconds
    */
	function updateSeconds() {
		jambi_timer_seconds = ("0" + Number(jambi_timer_seconds)).slice(-2);
		$($elementSeconds).text(jambi_timer_seconds);
	}

    /*
        Method: jambiTimer1()
        Purpose: init the timer
    */
	function jambiTimer1(){
    	// increment minutes
		if(jambi_timer_seconds >= 59) {
			jambi_timer_seconds = 0;
			jambi_timer_minutes++;
            // update mins
			updateMinutes();

            // increment the hours
			if(jambi_timer_minutes > 59) {
				jambi_timer_hours++;
				jambi_timer_minutes = 0;
                // update hours
				updateTime();
			}
		}
		else {
    		// add 1 to the seconds
			jambi_timer_seconds++;
		}
        // update seconds
		updateSeconds();
	}
    // return the start and stop of this class
	return {
		startTimer: function() { start(); },
		stopTimer: function() { stop(); }
	};
};