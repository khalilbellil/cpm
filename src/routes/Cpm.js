import React, { useState, useEffect } from 'react'
import Client from '../components/Client'
import ClientInfo from '../components/ClientInfo'
import Project from '../components/Project'
import { Button } from '@material-ui/core'
import History from '../components/History'
import top_arrow_icon from "../img/left-arrow.png";
import down_arrow_icon from "../img/right-arrow.png";

function Cpm() {
    const [uidClient, setUidClient] = useState(137332)
    const [clientProjectsUids, setClientProjectsUids] = useState([])
    const [opened, setOpened] = useState(false)
    const [reloadHistory, setReloadHistory] = useState(false)

    useEffect(() => {
        getClientProjectsUids(uidClient)
        document.getElementById("mySidebar").style.width = "0px" //Initialize sidebar
    }, []);

    const getClientProjectsUids = (uid_client) => {
        fetch('http://ssrv5.sednove.com:4000/client/get_projects?uid_client='+uid_client)
        .then(response => response.json())
        .then(response => setClientProjectsUids(response.data))
        .catch(err => alert(err))
    }
    const openNav = () => {
        if (document.getElementById("mySidebar").style.width === "0px"){
            document.getElementById("mySidebar").style.width = "300px";
            document.getElementById("main").style.marginLeft = "300px";
            setOpened(true)
        }else{
            document.getElementById("mySidebar").style.width = "0";
            document.getElementById("main").style.marginLeft = "0";
            setOpened(false)
        }
    }
    const handleHistoryChange = (v) => {
        if (reloadHistory){
            setReloadHistory(false)
        }else{
            setReloadHistory(true)
        }
    }

    return (
        <div>
            <div id="mySidebar" class="sidebar">
                <History reload_history={reloadHistory} uid_client={uidClient}/>
            </div>
            <div id="main">
                <div class="row">
                    <div class="col-3">
                        <ClientInfo uid_client="137332"/>
                    </div>
                    <div class="col">
                        <Client uid="137332"/>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <img width="40px" id="hide_history" src={(!opened)?down_arrow_icon:top_arrow_icon} alt="Cacher" onClick={() => openNav()}></img>
                        <Button style={{marginLeft:"8px"}} variant="contained">Recherche</Button>
                        <Button style={{marginLeft:"8px"}} variant="contained" color="primary">Prochain client</Button>
                    </div>
                </div>
                <br/>
                <div class="row">
                {
                    clientProjectsUids.map((p, i) => (
                    <div class="col-12 mb-5">
                        <Project reload_projects={() => {getClientProjectsUids(uidClient)}} onReloadHistory={handleHistoryChange} uid={p.uid}/>
                    </div>
                    ))
                }
            </div>
            </div>
        </div>
    )
}

export default Cpm
