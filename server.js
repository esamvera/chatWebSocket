
	const WebSoket = require("ws");
	const server = new WebSoket.Server({port: 9000});
	
	server.on("connection", onConnect);
	
	let allClientsOnLine = [];
	let allMessages = [];
	
	//Функция для ограничения количества отправляемых клиенту сообщений (50 штук)
	function limitedAllMessages(massiv){
		if(massiv.length > 50){
			massiv.reverse();
			let cuttedMassiv = massiv.slice(0, 50);
			return cuttedMassiv.reverse();			
		}
		else{
			return massiv;	
		}
		
	}
	
	function onConnect(client) {
		console.log("Connection opened");		
		
		
		// обрабатываем входящие сообщения от клиента
		client.on("message", function(message) {
			
			messageFromClient = JSON.parse(message.toString());			
			console.log("Client message:", messageFromClient[1]);         
			console.log(messageFromClient[0]);  
			
			// проверка ника на оригинальность
			if(messageFromClient[0] == "nick"){
				let unoriginal = allClientsOnLine.includes(messageFromClient[1]);
				console.log("unoriginal: ", unoriginal);  
				
				if(unoriginal == true){
					// allClientsOnLine.push(messageFromClient[1]);
					const warning = ["warning", "This nickname is already in the chat"];
					client.send(JSON.stringify(warning));
				}
				else{
					allClientsOnLine.push(messageFromClient[1]);
					let ltdMessages = limitedAllMessages(allMessages);
					ltdMessages.push(`${messageFromClient[1]} has joined the chat now`);
					ltdMessages.push(`Let's welcome ${messageFromClient[1]}`);					
					client.send(JSON.stringify(ltdMessages));
					
					let allClients = ["allClientsToClient"];
					let allClientsToClient = allClients.concat(allClientsOnLine);
					client.send(JSON.stringify(allClientsToClient));
				}
			}
			
			else if(messageFromClient[0] == "giveAllNicks"){
				let allClients = ["allClientsToClient"];
				let allClientsToClient = allClients.concat(allClientsOnLine);
				client.send(JSON.stringify(allClientsToClient));	
			}
			
			else if(messageFromClient[0] == "visibilitychange"){
				let visibilitychange = ["visibilitychange"];  // 	1 элемент массива - флаг типа сообщения про изменение видимости вкладки
				visibilitychange.push(messageFromClient[1]);	//	2 элемент массива - ник юзера, чья вкладка была неактивной
				visibilitychange.push(allClientsOnLine);	//	3 элемент массива - список всех ников на чате
				
				let ltdMessages = limitedAllMessages(allMessages);
				visibilitychange.push(ltdMessages);	// 	4 элемент массива - список всех сообщений в чате
				client.send(JSON.stringify(visibilitychange));	
			}
			
			else if(messageFromClient[0] == "invitePrivate"){
				let inviting = messageFromClient[1];
				let invited = messageFromClient[2];
				
				let invite = [];
				invite[0] = "inviteForPrivate";
				invite[1] = messageFromClient[1];	// 	inviting
				invite[2] = messageFromClient[2];  	//	invited
				
				console.log(invite);
				client.send(JSON.stringify(invite));
			}
			
			
			else if(messageFromClient[0] == "connectionClose"){
				if(messageFromClient[1] !== ""){
					//const indexLeaving = allClientsOnLine.indexOf(messageFromClient[1]);
					//console.log("indexLeaving", indexLeaving);
					//if(indexLeaving !== -1){
						//allClientsOnLine.splice(indexLeaving, 1);
						//const allClients = ["allClientsToClient"];
						//const allClientsToClient = allClients.concat(allClientsOnLine);
						//console.log("allClientsToClient", allClientsToClient);
						//client.send(JSON.stringify(allClientsToClient));
					//}
					
					let connectionClose = ["connectionClose"];  // 	1 элемент массива - флаг типа сообщения про изменение видимости вкладки				
					const indexLeaving = allClientsOnLine.indexOf(messageFromClient[1]);					
					allClientsOnLine.splice(indexLeaving, 1);				
					connectionClose.push(allClientsOnLine);	//	со 2  элемента массива - список всех ников на чате
					console.log("connectionClose!!!", connectionClose);
					client.send(JSON.stringify(connectionClose));	
				}

			}
			
			
			else{
				let ltdMessages = limitedAllMessages(allMessages);
				ltdMessages.push(messageFromClient[2]);
				ltdMessages.push(messageFromClient[1]);
				client.send(JSON.stringify(ltdMessages));	
			}		
		});
			
			
		// закрытие подключения
		client.on("close", function() {
			console.log("Connection closed");
		});
			
	}