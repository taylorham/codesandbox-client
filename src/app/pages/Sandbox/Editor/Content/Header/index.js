// @flow
import React from 'react';
import styled from 'styled-components';
import Save from 'react-icons/lib/md/save';
import Fork from 'react-icons/lib/go/repo-forked';
import Download from 'react-icons/lib/go/cloud-download';
import PlusIcon from 'react-icons/lib/go/plus';
import GithubIcon from 'react-icons/lib/go/mark-github';
import ChevronLeft from 'react-icons/lib/md/chevron-left';
import HeartIcon from 'react-icons/lib/fa/heart-o';
import FullHeartIcon from 'react-icons/lib/fa/heart';
import TwitterIcon from 'react-icons/lib/fa/twitter';
import { Tooltip } from 'react-tippy';

import type { Sandbox, CurrentUser } from 'common/types';
import sandboxActionCreators from 'app/store/entities/sandboxes/actions';
import userActionCreators from 'app/store/user/actions';
import { newSandboxUrl } from 'app/utils/url-generator';
import ModeIcons from 'app/components/sandbox/ModeIcons';

import User from 'app/containers/Navigation/User';

import Action from './Action';
import FeedbackView from './FeedbackView';
import ShareView from './ShareView';

const Container = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.background2};
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 40;
  margin: 0;
  height: 3rem;
  font-weight: 400;
  flex: 0 0 3rem;
  box-sizing: border-box;
  border-bottom: 1px solid ${props => props.theme.background2.darken(0.3)};
`;

const Right = styled.div`
  display: flex;
  height: 100%;
`;

const Left = styled.div`
  display: flex;
  height: 100%;
`;

const Chevron = styled.div`
  svg {
  transition: 0.3s ease all;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  z-index: 20;

  cursor: pointer;
  &:hover {
    transform: rotateZ(${props => (props.workspaceHidden ? '135deg' : '45deg')});
    color: white;
  }

  transform: rotateZ(${props => (props.workspaceHidden ? '180deg' : '0')});
  }
`;

type Props = {
  toggleWorkspace: () => void,
  workspaceHidden: boolean,
  sandbox: Sandbox,
  sandboxActions: typeof sandboxActionCreators,
  userActions: typeof userActionCreators,
  user: CurrentUser,
  canSave: boolean,
};

export default class Header extends React.PureComponent {
  props: Props;

  massUpdateModules = () => {
    const { sandbox, sandboxActions } = this.props;
    sandboxActions.massUpdateModules(sandbox.id);
  };

  zipSandbox = () => {
    const { sandbox, sandboxActions } = this.props;
    sandboxActions.createZip(sandbox.id);
  };

  forkSandbox = () => {
    const { sandbox, sandboxActions } = this.props;

    const shouldFork = sandbox.owned
      ? confirm('Do you want to fork your own sandbox?')
      : true;
    if (shouldFork) {
      sandboxActions.forkSandbox(sandbox.id);
    }
  };

  setEditorView = () => {
    const { sandbox, sandboxActions } = this.props;
    sandboxActions.setViewMode(sandbox.id, true, false);
  };

  setMixedView = () => {
    const { sandbox, sandboxActions } = this.props;
    sandboxActions.setViewMode(sandbox.id, true, true);
  };

  setPreviewView = () => {
    const { sandbox, sandboxActions } = this.props;
    sandboxActions.setViewMode(sandbox.id, false, true);
  };

  toggleLike = () => {
    const { sandbox, sandboxActions } = this.props;

    if (sandbox.userLiked) {
      sandboxActions.unLikeSandbox(sandbox.id);
    } else {
      sandboxActions.likeSandbox(sandbox.id);
    }
  };

  render() {
    const {
      sandbox,
      userActions,
      user,
      toggleWorkspace,
      workspaceHidden,
      canSave,
    } = this.props;

    return (
      <Container>
        <ModeIcons
          small
          showEditor={sandbox.showEditor}
          showPreview={sandbox.showPreview}
          setMixedView={this.setMixedView}
          setEditorView={this.setEditorView}
          setPreviewView={this.setPreviewView}
        />
        <Left>
          <Tooltip
            title={workspaceHidden ? 'Open sidebar' : 'Collapse sidebar'}
          >
            <Chevron
              workspaceHidden={workspaceHidden}
              onClick={toggleWorkspace}
            >
              <ChevronLeft />
            </Chevron>
          </Tooltip>
          {user.jwt &&
            (sandbox.userLiked
              ? <Action
                  tooltip="Undo like"
                  title={sandbox.likeCount}
                  Icon={FullHeartIcon}
                  onClick={this.toggleLike}
                />
              : <Action
                  tooltip="Like"
                  title={sandbox.likeCount}
                  Icon={HeartIcon}
                  onClick={this.toggleLike}
                />)}
          <Action onClick={this.forkSandbox} title="Fork" Icon={Fork} />
          <Action
            onClick={canSave && this.massUpdateModules}
            placeholder={canSave ? false : 'All modules are saved'}
            title="Save"
            Icon={Save}
          />
          <Action title="Download" Icon={Download} onClick={this.zipSandbox} />
          <ShareView sandbox={sandbox} />
        </Left>

        <Right>
          <Action
            href="https://twitter.com/ives13"
            a
            tooltip="Message me"
            Icon={TwitterIcon}
          />
          <FeedbackView
            email={user.email}
            sendMessage={userActions.sendFeedback}
          />
          <Action
            href={newSandboxUrl()}
            tooltip="New Sandbox"
            Icon={PlusIcon}
          />
          {user.jwt
            ? <div style={{ fontSize: '.875rem', margin: '6px 0.5rem' }}>
                <User small user={user} signOut={userActions.signOut} />
              </div>
            : <Action
                onClick={userActions.signIn}
                title="Sign in with Github"
                Icon={GithubIcon}
                highlight
                unresponsive
              />}
        </Right>
      </Container>
    );
  }
}
