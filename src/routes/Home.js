import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@material-ui/core'
import Login from '../components/Login'

function Home() {
    return (
        <div>
            <div class="widgets_panel row">
                {/* <div class="col">
                  <Link to="/cpm"><Card class="widgets_panel__card">Client's Projects Manager</Card></Link>
                </div>
                <div class="col">
                  <Link to="/call_center"><Card class="widgets_panel__card">Call Center</Card></Link>
                </div> */}
                <Login />
            </div>
        </div>
    )
}

export default Home
