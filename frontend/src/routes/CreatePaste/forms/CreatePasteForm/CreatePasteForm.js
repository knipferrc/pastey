import { Form, Grid, Segment } from 'semantic-ui-react'

import { Formik } from 'formik'
import PasteEditor from '../../components/PasteEditor'
import PasteInfo from '../../components/PasteInfo'
import PastePreview from '../../components/PastePreview'
import PropTypes from 'prop-types'
import React from 'react'
import SavePasteButton from '../../components/SavePasteButton'

const propTypes = {
  addPaste: PropTypes.func,
  user: PropTypes.object,
  history: PropTypes.object
}

const CreatePasteForm = ({ addPaste, user, history }) => {
  return (
    <Formik
      initialValues={{
        pasteContent: '',
        pasteTitle: '',
        pasteCategory: '',
        pasteDescription: ''
      }}
      validate={values => {
        let errors = {}
        if (!values.pasteTitle) {
          errors.pasteTitle = 'Required'
        }
        if (!values.pasteCategory) {
          errors.pasteCategory = 'Required'
        }
        if (!values.pasteDescription) {
          errors.pasteDescription = 'Required'
        }
        return errors
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          setSubmitting(true)
          await addPaste(
            values.pasteTitle,
            values.pasteCategory,
            values.pasteDescription,
            values.pasteContent,
            user._id,
            'unpublished'
          )
          history.push('/dashboard')
        } catch (e) {
          setSubmitting(false)
        }
      }}
      render={({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue
      }) => (
        <Form loading={isSubmitting} size="large" onSubmit={handleSubmit}>
          <Segment.Group as={Grid} stackable horizontal>
            <Grid.Row columns={1}>
              <Grid.Column>
                <SavePasteButton />
                <PasteInfo
                  pasteTitle={values.pasteTitle}
                  pasteCategory={values.pasteCategory}
                  pasteDescription={values.pasteDescription}
                  updateField={handleChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  touched={touched}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
              <Grid.Column>
                <PasteEditor
                  updatePasteContent={handleChange}
                  pasteContent={values.pasteContent}
                />
              </Grid.Column>
              <Grid.Column>
                <PastePreview pasteContent={values.pasteContent} />
              </Grid.Column>
            </Grid.Row>
          </Segment.Group>
        </Form>
      )}
    />
  )
}

CreatePasteForm.propTypes = propTypes

export default CreatePasteForm
