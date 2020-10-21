import React, { useState, useEffect } from 'react'
import '../styles/Client.css'
import { Badge } from '@material-ui/core'

function ClientInfo(props) {
    const local = true
    const apiAdress = (local)?"localhost:4000":"ssrv5.sednove.com:4000"
    const [uidClient, setUidClient] = useState(0)
    const [nbProject, setNbProject] = useState(0)
    const [nbActivatedProject, setNbActivatedProject] = useState(0)
    const [nbCanceledProject, setNbCanceledProject] = useState(0)

    useEffect(() => {
        setUidClient(props.uid_client)
        getClientInfo(props.uid_client)
    }, [props.uid_client]);

    const getClientInfo = (uid_client) => {
        if (uid_client !== 0)
            fetch(`http://${apiAdress}/client_info/nb_project?uid_client=${uid_client}`)
            .then(response => response.json())
            .then(response => {
                setNbProject(response.data.nb_project)
                setNbActivatedProject(response.data.nb_activated_project)
                setNbCanceledProject(response.data.nb_canceled_project)
            })
            .catch(err => alert(err))
    }

    return (
        <div class="client_info_panel">
            <br/>
            <div class="col-12">
                <Badge color="primary" badgeContent={"#"+uidClient}>
                    Client &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </Badge>
            </div>
            <div class="col-12 pt-2">
                <Badge color="secondary" badgeContent={nbProject}>
                    Total des projets &nbsp;
                </Badge>
            </div>
            <div class="col-12 pt-3">
                <Badge color="secondary" badgeContent={nbActivatedProject}>
                    Projets activés &nbsp;
                </Badge>
            </div>
            <div class="col-12 pt-3">
                <Badge color="secondary" badgeContent={nbCanceledProject}>
                    Projets annulés &nbsp;
                </Badge>
            </div>
            <br/>
        </div>
    )
}

export default ClientInfo
