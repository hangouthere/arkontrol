import React from 'react';
import { connect } from 'react-redux';
import Footer from '../../components/common/Footer';
import { IRootState } from '../../store/reducers';
import { IRemoteStatusState } from '../../store/reducers/remoteStatus';

const FooterContainer: React.FC<IRemoteStatusState> = props => <Footer {...props} />;

const mapStateToProps = (state: IRootState) => state.RemoteStatus;

export default connect(mapStateToProps)(FooterContainer);
