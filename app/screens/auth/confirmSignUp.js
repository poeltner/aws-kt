import React from 'react';
import {
  View,
  Image,
  Keyboard,
  Alert,
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkStyleSheet,
  RkTheme,
  RkAvoidKeyboard,
} from 'react-native-ui-kitten';
import {
  Auth,
} from 'aws-amplify';
import { ConfirmSignUp } from 'aws-amplify-react-native';
import { GradientButton } from '../../components/';
import { scaleVertical } from '../../utils/scale';

export class DefaultConfirmSignUp extends ConfirmSignUp {
  constructor(props) {
    super(props);

    this.state = {
      username: null,
      code: null,
      error: null,
    }

    this.confirm = this.confirm.bind(this);
    this.resend = this.resend.bind(this);
  }

  confirm() {
    const { username, code } = this.state;
    Auth.confirmSignUp(username, code)
      .then(data => {
        Alert.alert('Account is confirmed.');
        this.changeState('signedUp');
      })
      .catch(err => this.error(err));
  }

  resend() {
    const { username } = this.state;
    Auth.resendSignUp(username)
      .then(() => {
        Alert.alert('Code has been sent to your email.');
      })
      .catch(err => this.error(err));
  }

  componentWillReceiveProps(nextProps) {
    const username = nextProps.authData;
    if (username && !this.state.username) { this.setState({ username }); }
  }

  getThemeImageSource = (theme) => (
    theme.name === 'light' ?
      require('../../assets/images/logo.png') : require('../../assets/images/logoDark.png')
  );

  renderImage = () => (
    <Image style={styles.image} source={this.getThemeImageSource(RkTheme.current)} />
  );

  error(err) {
    let msg = '';
    if (typeof err === 'string') {
      msg = err;
    } else if (err.message) {
      msg = err.message;
    } else {
      msg = JSON.stringify(err);
    }

    const map = this.props.errorMessage || this.props.messageMap;
    msg = (typeof map === 'string') ? map : map(msg);
    this.setState({ error: msg });
    Alert.alert(msg);
  }

  showComponent() {
    return (
      <RkAvoidKeyboard
        style={styles.screen}
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => Keyboard.dismiss()}>
        <View style={{ alignItems: 'center' }}>
          {this.renderImage()}
          <RkText rkType='h1'>Confirm Email</RkText>
        </View>
        <View style={styles.content}>
          <View>
            <RkTextInput
              rkType='rounded'
              autoCapitalize='none'
              placeholder='Email'
              onChangeText={(text) => this.setState({ username: text })}
              value={this.state.username}
            />
            <RkTextInput
              rkType='rounded'
              autoCapitalize='none'
              placeholder='Code'
              onChangeText={(text) => this.setState({ code: text })} 
            />
            <GradientButton
              style={styles.save}
              rkType='large'
              text='CONFIRM'
              onPress={this.confirm}
            />
            <GradientButton
              style={styles.save}
              rkType='small'
              text='Resend Code'
              onPress={this.resend} 
              disabled={!this.state.username}
            />
          </View>
          <View style={styles.footer}>
            <View style={styles.textRow}>
              <RkText rkType='primary3'>Already have an account?</RkText>
              <RkButton rkType='clear' onPress={() => this.changeState('signIn')}>
                <RkText rkType='header6'>Sign in now</RkText>
              </RkButton>
            </View>
          </View>
        </View>
      </RkAvoidKeyboard>
    );
  }
}

const styles = RkStyleSheet.create(theme => ({
  screen: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: theme.colors.screen.base,
  },
  image: {
    marginBottom: 10,
    height: scaleVertical(77),
    resizeMode: 'contain',
  },
  content: {
    justifyContent: 'space-between',
  },
  save: {
    marginVertical: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: 24,
    marginHorizontal: 24,
    justifyContent: 'space-around',
  },
  footer: {
    justifyContent: 'flex-end',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
}));
