import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import 'spectre.css/dist/spectre.min.css'
import 'spectre.css/dist/spectre-icons.min.css'
import 'spectre.css/dist/spectre-exp.min.css'
import Heading from './Heading'
import Layout from './Layout'
import API from './api'
import PropTypes from 'prop-types'

const productPropTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }).isRequired
}

function ProductTableRow(props) {
  return (
    <tr className="product-item">
      <td>{props.product.name}</td>
      <td>{props.product.type}</td>
      <td>
        <Link
          className="btn btn-link"
          to={{
            pathname: '/products/' + props.product.id,
            state: {
              product: props.product
            }
          }}
        >
          See more!
        </Link>
      </td>
    </tr>
  )
}
ProductTableRow.propTypes = productPropTypes

function ProductTable(props) {
  const products = props.products.map((p) => <ProductTableRow key={p.id} product={p} />)
  return (
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th />
        </tr>
      </thead>
      <tbody>{products}</tbody>
    </table>
  )
}

ProductTable.propTypes = {
  products: PropTypes.arrayOf(productPropTypes.product)
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [products, setProducts] = useState([])
  const [visibleProducts, setVisibleProducts] = useState([])

  const id = new URLSearchParams(location.search).get('id') || undefined

  useEffect(() => {
    API.getAllProducts(id)
      .then((r) => {
        setLoading(false)
        setProducts(r)
        setVisibleProducts(r)
      })
      .catch((e) => {
        navigate('/error', {
          state: {
            error: e.toString()
          }
        })
      })
  }, [id, navigate])

  useEffect(() => {
    const findProducts = (search) => {
      search = search.toLowerCase()
      return products.filter(
        (p) =>
          p.id.toLowerCase().includes(search) ||
          p.name.toLowerCase().includes(search) ||
          p.type.toLowerCase().includes(search)
      )
    }
    setVisibleProducts(searchText ? findProducts(searchText) : products)
  }, [searchText, products])

  const onSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  return (
    <Layout>
      <Heading text="Products" href="/" />
      <div className="form-group col-2">
        <label className="form-label" htmlFor="input-product-search">
          Search
        </label>
        <input
          id="input-product-search"
          className="form-input"
          type="text"
          value={searchText}
          onChange={onSearchTextChange}
        />
      </div>
      {loading ? (
        <div className="loading loading-lg centered" />
      ) : (
        <ProductTable products={visibleProducts} />
      )}
    </Layout>
  )
}

export default App
