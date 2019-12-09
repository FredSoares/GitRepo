import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilter = async e => {
    e.preventDefault();
    console.log(e.target.value);

    this.setState({
      loading: true,
    });

    try {
      const state = e.target.value;
      const { repository } = this.state;

      const response = await api.get(
        `/repos/${repository.full_name}/issues?${state}`
      );

      this.setState({
        issues: response.data,
        loading: false,
      });
    } catch (error) {
      console.log('error');
    }
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return (
        <Loading>
          Loading
          <FaSpinner color="#fff" size={32} />
        </Loading>
      );
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Back</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <ul>
            <button
              type="button"
              onClick={this.handleFilter}
              value="state=open"
            >
              Aberto
            </button>
            <button
              type="button"
              onClick={this.handleFilter}
              value="state=closed"
            >
              Fechdo
            </button>
            <button type="button" onClick={this.handleFilter} value="state=all">
              Todos
            </button>
          </ul>
        </Owner>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
