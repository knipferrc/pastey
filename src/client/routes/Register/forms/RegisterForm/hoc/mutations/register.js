import { gql } from 'react-apollo'

export default gql`
  mutation register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    register(
      firstName: $firstName
      lastName: $lastName
      email: $email
      password: $password
    )
  }
`
