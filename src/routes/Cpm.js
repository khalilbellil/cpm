import React, { useState, useEffect } from 'react'
import Client from '../components/Client'
import ClientInfo from '../components/ClientInfo'
import Project from '../components/Project'
import { Button, TextField, Card } from '@material-ui/core'
import History from '../components/History'
import top_arrow_icon from "../img/left-arrow.png";
import down_arrow_icon from "../img/right-arrow.png";
import Popup from "reactjs-popup";
import { CardTitle } from 'reactstrap'

function Cpm() {
    const [uidClient, setUidClient] = useState(0)
    const [clientProjectsUids, setClientProjectsUids] = useState([])
    const [opened, setOpened] = useState(false)
    const [reloadHistory, setReloadHistory] = useState(false)
    const [username, setUsername] = useState('Khalil')
    const [popupSearchClient , setPopupSearchClient] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    useEffect(() => {
        document.getElementById("mySidebar").style.width = "0px" //Initialize sidebar
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('uid_client') !== null){
            setUidClient(urlParams.get('uid_client'))
            lockClient(urlParams.get('uid_client'))
        }
    }, []);

    const getClientProjectsUids = (uid_client) => {
        fetch('http://ssrv5.sednove.com:4000/client/get_projects?uid_client='+uid_client)
        .then(response => response.json())
        .then(response => setClientProjectsUids(response.data))
        .catch(err => alert(err))
    }
    const createProject = () => {
        if (uidClient !== 0)
            fetch('http://ssrv5.sednove.com:4000/projects/new?uid_client='+uidClient)
            .then(() => {
                getClientProjectsUids(uidClient)
            })
            .catch(err => alert(err))
        else
            alert("Aucun client selectionné")
    }
    const lockClient = (uid_client) => {
        fetch(`http://ssrv5.sednove.com:4000/clients/lock?uid_client=${uid_client}&origin=gestion-client&username=${username}`)
        .then(response => response.json())
        .then(response => {
          (response.data.already_locked === "no")?getClientProjectsUids(uid_client):alert("Client déjà verrouillé")
        })
        .catch(err => alert(err))
    }
    const unlockAllClients = () =>{
        fetch(`http://ssrv5.sednove.com:4000/clients/unlock?origin=gestion-client&username=${username}`)
        .catch(err => alert(err))
    }
    const getNextClient = () =>{
        setUidClient(0)
        fetch(`http://ssrv5.sednove.com:4000/clients/get_next_client?username=${username}&origin=gestion-client&lg=fr`)
        .then(response => response.json())
        .then(response => {
          if (response.data.found !== "no"){
            setUidClient(response.data[0].uid)
            setReloadHistory(true)
            unlockAllClients()
            lockClient(response.data[0].uid)
          }else{
            alert("Aucun client trouvé")
          }
        })
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
    const searchClient = (new_tab) => {
        if (searchValue !== ""){
            if (searchValue[0] === ":"){
                getClientByPhone(searchValue, new_tab)
            }else if (searchValue[0] === "#"){
                getClientByProject(searchValue, new_tab)
            }else{
                var url = window.location.href.split('?')[0] + "?uid_client=" + searchValue
                if (new_tab){
                    window.open(url, "_blank")
                }else{
                    setUidClient(searchValue)
                    lockClient(searchValue)
                }
            }
        }
        setPopupSearchClient(false)
    }
    const getClientByPhone = (phone, new_tab) => {
        phone = phone.replace(":","")
        fetch(`http://ssrv5.sednove.com:4000/clients/get_by_phone?phone=${phone}`)
        .then(response => response.json())
        .then(response => {
            if (new_tab){
                var url = window.location.href.split('?')[0] + "?uid_client=" + response.data[0].uid_client
                window.open(url, "_blank")
            }else{
                setUidClient(response.data[0].uid_client)
                lockClient(response.data[0].uid_client)
            }
        })
        .catch(err => alert(err))
    }
    const getClientByProject = (uid_project, new_tab) => {
        uid_project = uid_project.replace("#","")
        fetch(`http://ssrv5.sednove.com:4000/clients/get_by_project?uid_project=${uid_project}`)
        .then(response => response.json())
        .then(response => {
            if (new_tab){
                var url = window.location.href.split('?')[0] + "?uid_client=" + response.data[0].uid_client
                window.open(url, "_blank")
            }else{
                setUidClient(response.data[0].uid_client)
                lockClient(response.data[0].uid_client)
            }
        })
        .catch(err => alert(err))
    }

    return (
        <div>
            <div id="mySidebar" class="sidebar">
                <History reload_history={reloadHistory} uid_client={uidClient}/>
            </div>
            <div id="main">
                <div class="row">
                    <div class="col-3">
                        <ClientInfo uid_client={uidClient}/>
                    </div>
                    <div class="col">
                        <Client uid={uidClient}/>
                    </div>
                </div>
                <div class="row pt-2">
                    <div class="col">
                        <img width="40px" id="hide_history" src={(!opened)?down_arrow_icon:top_arrow_icon} alt="Cacher" onClick={() => openNav()}></img>
                        <Button style={{marginLeft:"8px"}} variant="contained" onClick={() => setPopupSearchClient(true)}>Recherche</Button>
                        <Popup
                        onClose={() => setPopupSearchClient(false)}
                        closeOnDocumentClick
                        open={popupSearchClient}
                        >
                        <span>
                            <Card body inverse class="popup">
                            <CardTitle class="popupbox_title" style={{textAlign:"center"}}>Recherche client</CardTitle>
                            <TextField defaultValue=" " fullWidth label="uid_client/ #uid_project/ :phone" variant="outlined" name="search_value"
                            onChange={(e)=>{setSearchValue(e.target.value)}} 
                            value={searchValue}/>
                            <div class="row p-2">
                                <Button className="popupbox_button" variant="contained" color="primary" onClick={()=> {searchClient(true)}}>Rechercher(Nouvelle fenêtre)</Button>
                                <Button className="ml-1 popupbox_button" variant="contained" color="primary" onClick={()=> {searchClient(false)}}>Rechercher(Même fenêtre)</Button>
                                <Button className="ml-1 popupbox_button" variant="contained" color="primary" onClick={()=> {setPopupSearchClient(false)}}>Annuler</Button>
                            </div>
                            </Card>
                        </span>
                        </Popup>
                        <Button style={{marginLeft:"8px"}} variant="contained" color="primary" onClick={getNextClient}>Prochain client</Button>
                        <Button style={{marginLeft:"8px"}} variant="contained" color="primary" onClick={createProject} disabled={(uidClient === 0)}>Nouveau projet</Button>
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
