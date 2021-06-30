
import React, {Fragment} from 'react'
// Material UI
import { useTheme } from '@material-ui/core/styles';
import { Link } from 'gatsby'

const useStyles = theme => ({
  head: {
    color: '#777777',
    fontSize: theme.typography.fontSize,
    fontWeight: 500,
    textTransform: 'uppercase'
  },
  list: {
    paddingLeft: 0,
    '& li': {
      listStyle: 'none',
      marginBottom: theme.spacing(1),
    },
    '& a': {
      textDecoration: 'none',
      '&:link,&:visited': {
        color: '#777777',
      },
      '&:hover': {
        color: theme.link.light,
      },
    },
  },
  childList: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  }
})

const Toc = ({
  maxLevel,
  items,
}) => {
  const styles = useStyles(useTheme())
  const renderToc = (level, items) => { 
    return maxLevel >= level && (
    <ul css={[styles.list, level > 1 ? styles.childList : null ]}>
      {items.map((item) => (
        <Fragment key={item.url} >
          <li>
            <Link to={item.url}>{item.title}</Link>
            {item.items && renderToc(++level, item.items)}
          </li>
        </Fragment>
      ))}
    </ul>
  )}
  return (
    <nav>
      <span css={styles.head}>Table of Contents</span>
      {renderToc(1, items)}
    </nav>
  )
}

export default Toc
