<?php
					
					// if the route param in the form is set, and isn't blank, then return that specified route; will have to also end up handling if
					// given route is not in MARTA API. If route given is blank, we output every route.
					if(isset($_GET['route']) && $_GET['route'] != ""){
						$userTarget = $_GET['route'];
						$url = "http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetBusByRoute/" . $userTarget;
						$details = getData($url);
					}else{
						$url = "http://developer.itsmarta.com/BRDRestService/RestBusRealTimeService/GetAllBus";
						$details = getData($url);
					}

					// details hold whatever data pieces were extracted and converted to JSON. We will print this out, to in turn be stored by the results var in the ajax call in the JS file.
					print_r($details);


					//getData takes in url it will get data from; this will either be a specified route, if the user enters a route number in the form, or ALL of the routes, if the user leaves the route blank.

					//it will return the json encoded version of the cURL reponse from the MARTA API url
					function getData($url){
						// initialize curl and begin setting up curl options, specifying url endpoint of API and
						// custom REST request - being GET, return type, possible timeout threshold, and some otha junk
						$curl = curl_init();

						curl_setopt_array($curl, array(
						  CURLOPT_URL => $url,
						  CURLOPT_RETURNTRANSFER => true,
						  CURLOPT_TIMEOUT => 30,
						  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
						  CURLOPT_CUSTOMREQUEST => "GET",
						  CURLOPT_HTTPHEADER => array(
						    "cache-control: no-cache"
						  ),
						));

						// store that return transfer in response var - and same for error; using curl_error instead
						$response = curl_exec($curl);
						$err = curl_error($curl);

						// we close the curl obj we made after we are done with it
						curl_close($curl);

						// transform given response into viable json we can work with in php
						// contains "all routes" from MARTA in json. ENCODE ENCODE ENCODE! NOT JSON DECODE... fawk
						$response = json_encode($response, true);

						return $response;
					}

				
//previous method of extracting n displaying all routes
					
					// foreach($response as $bus){
					// 	print_r($bus);
					// }

					// MARTA buses are done for the night: 12pm end on weekdays
					// if($response == []){
					// 	print_r("<img id=\"off-the-clock\" src=\"./assets/waiting.gif\">
					// 			 <div id=\"notice-wrapper\">
					// 				<div id=\"closed-notice\">
					// 			       		<h2>There are currently no buses out right now</h2>
					// 			       		<p>Most MARTA bus routes operate on weekdays from approximately 5 a.m. to midnight. 
					// 			    	   	 On weekends and holidays, buses typically start later and are less frequent.</p>
					// 			 	</div>
					// 			 </div>");
					// }else{
					// 	// will go thru JSON response from MARTA API, and siphon out details such as:
					// 	// location, direction, bus id, and most recent time update
					// 	foreach($response as $bus){
					// 		print_r("<div class=\"route\"><div class = \"title-holder\"><h2>BUS ROUTE:</h2></div>" 
					// 				. "<ul>"
					// 				. "<li><b>Location:</b> " . $bus["TIMEPOINT"] . "</li>" 
					// 				. "<li><b>Heading</b> " . $bus["DIRECTION"] . "</li>" 
					// 				. "<li><b>Bus Number:</b> " . $bus["VEHICLE"] . "</li>" 
					// 				. "<li><b>Most Recent Update:</b> " . $bus["MSGTIME"] . "</li>" 
					// 				. "</ul>" 
					// 				. "</div>");
					// 	}
					// }


			
					
			?>