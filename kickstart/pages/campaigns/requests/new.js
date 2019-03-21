import React, { Component } from 'react';
import Layout from '../../../components/layout';
import { Form, Button, Input, Message, Transition } from 'semantic-ui-react';
import web3 from '../../../ethereum/web3';
import Campaign from '../../../ethereum/campaign';
import {Link, Router} from '../../../routes';

export default class RequestNew extends Component {
  state = {
    value: '',
    description: '',
    recipient: '',
    loading: false,
    errorMessage: '',
    success: false
  };

	static async getInitialProps(props) {
		const {address} = props.query;
		return {address};
	}

	onSubmit = async event => {
		event.preventDefault();
		const campaign = Campaign(this.props.address);
		const {description, value, recipient} = this.state;

		this.setState({errorMessage: '', loading: true, success: false});

		try {
			const accounts = await web3.eth.getAccounts();
			await campaign.methods.createRequest(
				description, 
				web3.utils.toWei(value, 'ether'),
				recipient
			).send({
				from: accounts[0]
			});
		}	catch(err) {
			this.setState({errorMessage: err.message});
		}	
		this.setState({loading: false, description: '', value: '', recipient: '', success: true});
    setTimeout(() => {this.setState({success: false})}, 3000);
	}

	render() {
		return (
      <Layout>
        <Link route={`/campaigns/${this.props.address}/requests`}>
          <a>Back</a>
        </Link>
        <h3>Create a Request</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Description</label>
            <Input
              value={this.state.description}
              onChange={event =>
                this.setState({ description: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label>Value in Ether</label>
            <Input
              value={this.state.value}
              onChange={event => this.setState({ value: event.target.value })}
            />
          </Form.Field>

          <Form.Field>
            <label>Recipient</label>
            <Input
              value={this.state.recipient}
              onChange={event =>
                this.setState({ recipient: event.target.value })}
            />
          </Form.Field>

          <Message error header="Oops!" content={this.state.errorMessage} />
          <Transition visible={this.state.success} duration={'2000'}>
            <Message success header='Success!' content='Request has been created'/>
          </Transition>
          <Button primary loading={this.state.loading}>
            Create!
          </Button>
        </Form>
      </Layout>
		);
	}
}
