// @flow
import React from 'react';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createSelector } from 'reselect';

import type { Sandbox } from 'common/types';

import { sandboxesSelector } from 'app/store/entities/sandboxes/selectors';
import sandboxActionCreators from 'app/store/entities/sandboxes/actions';

import Title from 'app/components/text/Title';
import Centered from 'app/components/flex/Centered';

import Editor from './Editor';

type Props = {
  sandbox: ?Sandbox,
  sandboxes: { [id: string]: Sandbox },
  sandboxActions: typeof sandboxActionCreators,
  match: { params: { id: ?string } },
};
type State = {
  notFound: boolean,
};

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const mapStateToProps = createSelector(
  sandboxesSelector,
  (_, props) => props.match.params.id,
  (sandboxes, id) => {
    const sandbox = sandboxes[id];

    return { sandbox, sandboxes };
  },
);
const mapDispatchToProps = dispatch => ({
  sandboxActions: bindActionCreators(sandboxActionCreators, dispatch),
});
class SandboxPage extends React.PureComponent {
  componentDidMount() {
    this.fetchSandbox();
  }

  fetchSandbox = () => {
    const { id } = this.props.match.params;

    if (id) {
      this.props.sandboxActions.getById(id).then(null, this.handleNotFound);
    }
  };

  componentDidUpdate(oldProps) {
    const newId = this.props.match.params.id;
    const oldId = oldProps.match.params.id;

    if (newId != null && oldId !== newId) {
      this.setState({ notFound: false }); // eslint-disable-line
      if (!this.props.sandboxes[newId] || !this.props.sandboxes[newId].forked) {
        this.fetchSandbox();
      }
    }
  }

  handleNotFound = e => {
    if (e.response && e.response.status === 404) {
      this.setState({ notFound: true });
    }
  };

  props: Props;
  state: State;
  state = { notFound: false };

  render() {
    const { sandbox, match } = this.props;
    if (this.state.notFound) {
      return (
        <Centered horizontal vertical>
          <Title>
            We could not find the Sandbox you{"'"}re looking for...
            <br />
            <br />
            <Link to="/s/new">Create Sandbox</Link>
          </Title>
        </Centered>
      );
    }
    if (!sandbox) return null;

    document.title = sandbox.title
      ? `${sandbox.title} - CodeSandbox`
      : 'Editor - CodeSandbox';

    return (
      <Container>
        <Editor match={match} sandbox={sandbox} />
      </Container>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SandboxPage);
