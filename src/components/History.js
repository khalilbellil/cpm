import React, { useState, useEffect } from 'react'
import { Table } from '@material-ui/core';
import { format } from 'date-fns';
import '../styles/Project.css'

function History(props) {
    const local = true
    const apiAdress = (local)?"localhost:4000":"ssrv5.sednove.com:4000"
    const [historyData, setHistoryData] = useState([])
    const [uidClient, setUidClient] = useState([])

    useEffect(() => {
        setUidClient(props.uid_client)
        getHistory(props.uid_client)
    }, [props.uid_client]);
    useEffect(() => {
        getHistory(props.uid_client)
    }, [props.reload_history]);

    const getHistory = (uid) => {
        if (uid !== 0){
            setHistoryData([])
            fetch(`http://${apiAdress}/client_history/get_by_client?uid_client=${uid}&lg=fr`)
            .then(response => response.json())
            .then(response => setHistoryData(response.data))
            .catch(err => alert(err))
        }
    }

    return (
        <div>
            <div class="col history" style={{textAlign:"center", padding:0}}>
                <h3>Historique</h3>
                <Table style={{fontSize:"12px"}}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Action</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                      historyData.map((h) => {
                            return (
                            <tr>
                                <td>{format(new Date(h.sn_cdate), 'yyyy-MM-dd hh:mm:ss a')}</td>
                                <th scope="row">{h.msg}</th>
                                <td>{h.followup_agent}</td>
                            </tr>
                            )
                          }
                      )
                    }
                    </tbody>
                </Table>
            </div>
        </div>
    )
}

export default History
