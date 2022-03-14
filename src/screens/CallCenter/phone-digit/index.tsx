import React from 'react';
import { View, TouchableOpacity, DeviceEventEmitter, EmitterSubscription, Animated, Keyboard } from 'react-native';
import { WrapText, ButtonRipple } from 'mo-app-comp';
import { Styles, Color, EmitKeys, Constants } from 'mo-app-common';
import styles from './styles';

interface IPhoneDigitModalProps {
	callId: string;
}

interface IPhoneDigitModalState {
	value: string;
	animY: Animated.Value;
}

class PhoneDigitModal extends React.PureComponent<IPhoneDigitModalProps, IPhoneDigitModalState> {

	endCallSubscription: EmitterSubscription;
	constructor(props: IPhoneDigitModalProps) {
		super(props);
		this.state = {
			value: '',
			animY: new Animated.Value(550)
		};
		this.endCallSubscription = DeviceEventEmitter.addListener(EmitKeys.CALL_CENTER_DID_END_CALL, () => {
			this.close();
		});
	}

	componentDidMount() {
		this.show();
	}

	componentWillUnmount() {
		this.endCallSubscription.remove();
	}

	onDigitPressHandler = (digit: string): void => {
		const { value } = this.state;
		const { callId } = this.props;
		// console.log('onDigitPressHandler value ', digit, callId);
		this.setState({
			value: `${value}${digit}`
		});
		DeviceEventEmitter.emit(EmitKeys.CALL_CENTER_SEND_DIGIT, digit, callId);
	}

	onClosePressHandler = () => {
		this.close();
	}

	close = () => {
		Keyboard.dismiss();
		const { animY } = this.state;
		Animated.timing(animY, {
			toValue: 550,
			duration: 250,
			useNativeDriver: true,
		}).start(_finish => {
			setTimeout(() => {
				Constants.ModalShowing = false;
				DeviceEventEmitter.emit(Constants.EmitCode.PopModal);
			}, 20);
		});
	}

	show = () => {
		const { animY } = this.state;
		Animated.timing(animY, {
			toValue: 0,
			duration: 250,
			useNativeDriver: true,
		}).start(_finish => { });
	}

	render() {
		const { value, animY } = this.state;
		const transformContentStyle = {
			transform: [{
				translateY: animY,
			}]
		};
		return (
			<Animated.View style={[styles.container, transformContentStyle]}>
				<View style={[styles.header]}>
					<WrapText st={[Styles.Text_XXL_B, { fontSize: 24, lineHeight: 24 }]}>{value}</WrapText>
					<View style={[styles.closeButton]}>
						<ButtonRipple name={'close'} size={20} color={Color.text}
							onPress={this.onClosePressHandler} />
					</View>
				</View>

				<View style={[styles.bodyContainer]}>
					<View style={[Styles.RowCenter, { height: 57, marginTop: 35 }]}>
						<DigitItem value={'1'} onPress={this.onDigitPressHandler} />
						<DigitItem value={'2'} onPress={this.onDigitPressHandler} />
						<DigitItem value={'3'} onPress={this.onDigitPressHandler} />
					</View>

					<View style={[Styles.RowCenter, { height: 57, marginTop: 30 }]}>
						<DigitItem value={'4'} onPress={this.onDigitPressHandler} />
						<DigitItem value={'5'} onPress={this.onDigitPressHandler} />
						<DigitItem value={'6'} onPress={this.onDigitPressHandler} />
					</View>

					<View style={[Styles.RowCenter, { height: 57, marginTop: 30 }]}>
						<DigitItem value={'7'} onPress={this.onDigitPressHandler} />
						<DigitItem value={'8'} onPress={this.onDigitPressHandler} />
						<DigitItem value={'9'} onPress={this.onDigitPressHandler} />
					</View>

					<View style={[Styles.RowCenter, { height: 57, marginTop: 30 }]}>
						<DigitItem value={'*'} style={{ paddingTop: 15 }} onPress={this.onDigitPressHandler} />
						<DigitItem value={'0'} onPress={this.onDigitPressHandler} />
						<DigitItem value={'#'} onPress={this.onDigitPressHandler} />
					</View>
				</View>
			</Animated.View>
		);
	}

}

interface IDigitItemProps {
	style?: any;
	value: string
	onPress?: (value: string) => void;
}
const DigitItem = (props: IDigitItemProps) => {
	const { value, style, onPress } = props;
	return (
		<View key={`key_${props.value}`} style={{ flex: 1 / 3, alignItems: 'center' }}>
			<TouchableOpacity
				onPress={() => onPress(value)}
				style={[{ width: 57, height: 57, borderRadius: 30, borderColor: Color.gray, borderWidth: 1, paddingTop: 5 }, Styles.CenterItem, style]}>
				<WrapText st={[Styles.Text_XL_M, { fontSize: 25, textAlign: 'center' }]}>{props.value}</WrapText>
			</TouchableOpacity>
		</View>
	);
};

export default PhoneDigitModal;
