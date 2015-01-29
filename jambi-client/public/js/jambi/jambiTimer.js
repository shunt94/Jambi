var jambiTimer = function($elementSeconds, $elementMins, $elementHours){
	var jambi_timer_seconds = 0;
	var jambi_timer_minutes = 0;
	var jambi_timer_hours = 0;
	
	var jambi_timer;
	
	function start() {
		jambi_timer = setInterval(jambiTimer1, 1000);
	}
	
	function stop() {
		clearInterval(jambi_timer);
	}
	
	function updateMinutes() {
		jambi_timer_minutes = ("0" + Number(jambi_timer_minutes)).slice(-2);
		$($elementMins).text(jambi_timer_minutes);
	}
	
	function updateTime() {
		jambi_timer_minutes = ("0" + Number(jambi_timer_minutes)).slice(-2);
		$($elementMins).text(jambi_timer_minutes);
		jambi_timer_hours = ("0" + Number(jambi_timer_hours)).slice(-2);
		$($elementHours).text(jambi_timer_hours);
	}
	
	function updateSeconds() {
		jambi_timer_seconds = ("0" + Number(jambi_timer_seconds)).slice(-2);
		$($elementSeconds).text(jambi_timer_seconds);
	}

	function jambiTimer1(){	
		if(jambi_timer_seconds >= 59) {
			jambi_timer_seconds = 0;    
			jambi_timer_minutes++;
			
			updateMinutes();
			
			if(jambi_timer_minutes > 59) {
				jambi_timer_hours++;
				jambi_timer_minutes = 0;
				
				updateTime();
			}
		}
		else {
			jambi_timer_seconds++;
		}
		
		updateSeconds();
	}
	
	return {
		startTimer: function() { start(); },
		stopTimer: function() { stop(); }
	};
};