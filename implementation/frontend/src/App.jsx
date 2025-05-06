import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import Register from './pages/Register';
import Home from './pages/Home';
import Viewport from './components/Viewport';
import Transfer from './pages/Transfer';
import PayBill from './pages/PayBill';

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>

        {/* All routes here require auth*/ }
        <Route element={<RequireAuth/>}>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/accounts/:id" element={<Account/>}/>
          <Route path="/transfer" element={<Transfer/>}/>
          <Route path="/paybill" element={<PayBill/>}/>
          {/* add more protected routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
