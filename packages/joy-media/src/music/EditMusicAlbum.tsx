import React from 'react';
import { Button, Tab } from 'semantic-ui-react';
import { Form, withFormik } from 'formik';
import { History } from 'history';

import TxButton from '@polkadot/joy-utils/TxButton';
import { ContentId } from '@joystream/types/media';
import { onImageError, DEFAULT_THUMBNAIL_URL } from '../utils';
import { ReorderableTracks } from './ReorderableTracks';
import { MusicAlbumPreviewProps } from './MusicAlbumPreview';
import { MusicAlbumValidationSchema, MusicAlbumType, MusicAlbumClass as Fields } from '../schemas/music/MusicAlbum';
import { MusicTrackType } from '../schemas/music/MusicTrack';
import { withMediaForm, MediaFormProps } from '../common/MediaForms';
import { genreOptions, moodOptions, themeOptions, licenseOptions, visibilityOptions } from '../common/DropdownOptions';
import * as Opts from '../common/DropdownOptions';

type OuterProps = {
  isStorybook?: boolean,
  history?: History,
  contentId: ContentId,
  entity?: MusicAlbumType,
  tracks?: MusicTrackType[]
};

type FormValues = MusicAlbumType;

const InnerForm = (props: MediaFormProps<OuterProps, FormValues>) => {
  const {
    isStorybook,

    // React components for form fields:
    MediaText,
    MediaField,
    MediaDropdown,
    LabelledField,

    // Callbacks:
    onSubmit,
    onTxSuccess,
    onTxFailed,

    // history,
    // contentId,
    entity,
    tracks = [],

    values,
    dirty,
    isValid,
    isSubmitting,
    resetForm
  } = props;

  const { thumbnail } = values;

  const isNew = !entity;

  const buildTxParams = () => {
    if (!isValid) return [];

    return [ /* TODO save entity to versioned store */ ];
  };

  const basicInfoTab = () => <Tab.Pane as='div'>
    <MediaText field={Fields.title} {...props} />
    <MediaText field={Fields.thumbnail} {...props} />
    <MediaField field={Fields.description} component='textarea' rows={3} disabled={isSubmitting} {...props} />
    <MediaDropdown field={Fields.publicationStatus} options={Opts.visibilityOptions} {...props} />
  </Tab.Pane>

  const additionalTab = () => <Tab.Pane as='div'>
    <MediaText field={Fields.artist} {...props} />
    <MediaText field={Fields.composerOrSongwriter} {...props} />
    <MediaDropdown field={Fields.genre} options={Opts.genreOptions} {...props} />
    <MediaDropdown field={Fields.mood} options={Opts.moodOptions} {...props} />
    <MediaDropdown field={Fields.theme} options={Opts.themeOptions} {...props} />
    <MediaDropdown field={Fields.license} options={Opts.licenseOptions} {...props} />
  </Tab.Pane>

  const tracksTab = () => {
    const album: MusicAlbumPreviewProps = {
      id: 'ignore',
      title: values.title,
      artist: values.artist,
      cover: values.thumbnail,
      tracksCount: tracks.length
    }

    return <Tab.Pane as='div'>
      <ReorderableTracks 
        album={album} tracks={tracks}
      />
    </Tab.Pane>
  }

  const tabs = () => <Tab
    menu={{ secondary: true, pointing: true, color: 'blue' }}
    panes={[
      { menuItem: 'Basic info', render: basicInfoTab },
      { menuItem: 'Additional', render: additionalTab },
      { menuItem: `Tracks (${tracks.length})`, render: tracksTab },
    ]}
  />;

  const MainButton = () => {
    const isDisabled = !dirty || isSubmitting;

    const label = isNew
      ? 'Publish'
      : 'Update';

    if (isStorybook) return (
      <Button
        primary
        type='button'
        size='large'
        disabled={isDisabled}
        content={label}
      />
    );

    return <TxButton
      type='submit'
      size='large'
      isDisabled={isDisabled}
      label={label}
      params={buildTxParams()}
      tx={isNew
        ? 'dataDirectory.addMetadata'
        : 'dataDirectory.updateMetadata'
      }
      onClick={onSubmit}
      txFailedCb={onTxFailed}
      txSuccessCb={onTxSuccess}
    />
  }

  return <div className='EditMetaBox'>
    <div className='EditMetaThumb'>
      {thumbnail && <img src={thumbnail} onError={onImageError} />}
    </div>

    <Form className='ui form JoyForm EditMetaForm'>
      
      {tabs()}

      {/* TODO add metadata status dropdown: Draft, Published */}

      <LabelledField style={{ marginTop: '1rem' }} {...props}>
        <MainButton />
        <Button
          type='button'
          size='large'
          disabled={!dirty || isSubmitting}
          onClick={() => resetForm()}
          content='Reset form'
        />
      </LabelledField>
    </Form>
  </div>;
};

export const EditMusicAlbum = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: props => {
    const { entity } = props;

    return {
      // Basic:
      title: entity && entity.title || '',
      thumbnail: entity && entity.thumbnail || DEFAULT_THUMBNAIL_URL,
      description: entity && entity.description || '',
      publicationStatus: entity && entity.publicationStatus || visibilityOptions[0].value,

      // Additional:
      artist: entity && entity.artist || '',
      composerOrSongwriter: entity && entity.composerOrSongwriter || '',
      genre: entity && entity.genre || genreOptions[0].value,
      mood: entity && entity.mood || moodOptions[0].value,
      theme: entity && entity.theme || themeOptions[0].value,
      explicit: entity && entity.explicit || false, // TODO explicitOptions[0].value,
      license: entity && entity.license || licenseOptions[0].value,
    };
  },

  validationSchema: MusicAlbumValidationSchema,

  handleSubmit: () => {
    // do submitting things
  }
})(withMediaForm(InnerForm));

export default EditMusicAlbum;