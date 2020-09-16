import React from 'react'
import '../styles/Client.css'
import { Badge } from '@material-ui/core'

function ClientInfo() {
    return (
        <div class="client_info_panel">
            <br/>
            <div class="col-12">
                <Badge color="primary" badgeContent="#13123">
                    Client &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </Badge>
            </div>
            <div class="col-12 pt-2">
                <Badge color="secondary" badgeContent="3">
                    Total des projets &nbsp;
                </Badge>
            </div>
            <div class="col-12 pt-3">
                <Badge color="secondary" badgeContent="1">
                    Projets activés &nbsp;
                </Badge>
            </div>
            <div class="col-12 pt-3">
                <Badge color="secondary" badgeContent="2">
                    Projets annulés &nbsp;
                </Badge>
            </div>
            <br/>
        </div>
    )
}

export default ClientInfo
