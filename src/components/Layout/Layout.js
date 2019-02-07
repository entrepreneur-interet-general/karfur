import React, { Component }  from 'react';

import Aux from '../../hoc/Aux';
import Toolbar from '../Navigation/Toolbar/Toolbar';
import Footer from '../Navigation/Footer/Footer';
import SideDrawer from '../Navigation/SideDrawer/SideDrawer';

import './Layout.css';

import i18n from '../../i18n';
import { withNamespaces } from 'react-i18next';

import DirectionProvider, { DIRECTIONS } from 'react-with-direction/dist/DirectionProvider';

const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
}
class Layout extends Component {
    state = {
        showSideDrawer: false
    }

    sideDrawerClosedHandler = () => {
        this.setState( { showSideDrawer: false } );
    }

    sideDrawerToggleHandler = () => {
        this.setState( ( prevState ) => {
            return { showSideDrawer: !prevState.showSideDrawer };
        } );
    }
    
    render() {
        return (
            <DirectionProvider direction={i18n.language==="ar" ? DIRECTIONS.RTL : DIRECTIONS.LTR}>
                <Aux>
                    <Toolbar drawerToggleClicked={this.sideDrawerToggleHandler} />
                    <SideDrawer
                        open={this.state.showSideDrawer}
                        closed={this.sideDrawerClosedHandler} />
                    <main className="Content">
                        <div>
                            <button onClick={() => changeLanguage('fr')}>fr</button>
                            <button onClick={() => changeLanguage('en')}>en</button>
                            <button onClick={() => changeLanguage('ar')}>ar</button>
                            <h1>{this.props.t('Bienvenue')}</h1>
                        </div>
                        <div>Toolbar, SideDrawer and Backdrop</div>
                        {this.props.children}
                    </main>
                    <Footer />
                </Aux>
            </DirectionProvider>
        )
    }
}

export default withNamespaces()(Layout);