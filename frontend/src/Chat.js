import {useState,useEffect} from 'react'
import Image from './Image';
import './Chat.css'

function Chat({socket,username,room,onusers}){
    const [typedmsg,Settypedmsg] = useState("");
    const [allmsg,Setallmsg] = useState([]);
    const [file,Setfile] = useState();
    const [currentUser,SetcurrentUser] = useState([]);
    const [onlineUser,SetonlineUser] = useState(onusers);

    const exitRoom = () =>{
        const updatearry = onlineUser.filter((user) => user !== username)
        SetonlineUser(updatearry)
    }
    const sendMsg = async() =>{
        const minutes =  new Date(Date.now()).getMinutes() 
        const updatedmin = (minutes < 10 ? '0' : '') + minutes;
        if(file){
            const msgObject = {
                room:room,
                username:username,
                type:"file",
                time: new Date(Date.now()).getHours() + ":" +updatedmin,
                body:file,
                mimeType :file.type,
                fileName: file.name,

            } 
            await socket.emit("send_msg",msgObject);
            Setfile();
            Setallmsg((object)=>[...object,msgObject]);


        }
        else{
            if (typedmsg !== ""){
                const msgObject = {
                    room: room,
                    username:username,
                    type:"text",
                    msg : typedmsg,
                    time: new Date(Date.now()).getHours() + ":" +
                    updatedmin,
                    
                          
                }
            await socket.emit("send_msg",msgObject);
            Setallmsg((object)=>[...object,msgObject]);
            }
        }
      
        Settypedmsg("");
        
    };
    const selectFile = (event) =>{
        Settypedmsg(event.target.files[0].name);
        Setfile(event.target.files[0])

      }

useEffect(()=>{
    socket.on("receive_msg",(data)=>{
        Setallmsg((object)=>[...object,data]);
    })

},[socket])


function rendermessages(message){
    if(message.type ==="file"){
        const blob = new Blob([message.body],{type:message.type});
        const user = username===message.username ? "me" : "you";
        return(
            <div id = {username===message.username ? "me" : "you"}>
            <Image filename = {message.fileName} blob = {blob} message = {message} user ={user}></Image>
            </div>
        )
    }
    else{
        
            return(
                <div id = {username===message.username ? "me" : "you"}>
                <div id = "msg-meta1">
                    <p>{username===message.username ? "You" : message.username}</p>
                    <span>{message.time}</span>
                </div>
                  <div id ="text-msg">
                    {message.msg}
                </div>
                
                </div>
                
            )
    }
}
return(
    <>
    <div className='chat-container'>
        <div className = "chat-header">
               <p>Live Chat</p>
               <button onClick ={exitRoom}>Exit</button>
        </div>

        <div className = "chat-body">
        {allmsg.map(rendermessages)}     
        </div>

        <div className = "chat-footer">
            <input type = "text"
            value = {typedmsg}
             placeholder = "Enter Message" 
             onKeyPress ={(event) =>{
                event.key === "Enter" && sendMsg()
             }}
             onChange={(event) =>{
                Settypedmsg(event.target.value);
             }}></input>

            <label for="fileInput" className = "label">Upload Image</label>
            <input type="file" id="fileInput" onChange={selectFile}/>
            <button onClick={sendMsg}>Send</button>
        </div>
    </div>
    <div className = "online">
         {currentUser.map((user)=>{
            <div>
                {user}
            </div>
         })}
    </div>
    </>
)
}

export default Chat;